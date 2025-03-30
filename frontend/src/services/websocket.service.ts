import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

export interface LogDetails {
  delay: number;
  statusCode: number;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  level: string;
  message: string;
  details: LogDetails;
  type: 'mock' | 'proxy' | 'system';
}

class WebSocketService {
  private socket: Socket | null = null;
  private logs = new BehaviorSubject<LogEntry[]>([]);
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.socket?.connected) {
      console.log('Socket già connesso');
      return;
    }

    console.log('Tentativo di connessione al WebSocket...');
    this.socket = io('/', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      autoConnect: true,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('Connesso al WebSocket con ID:', this.socket?.id);
      this.reconnectAttempts = 0;
      console.log('Richiedo i log iniziali...');
      this.socket?.emit('getProxyAndMockLogs');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnesso dal WebSocket. Motivo:', reason);
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Errore di connessione WebSocket:', error);
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('Errore WebSocket:', error);
    });

    this.socket.on('newLog', (log: LogEntry) => {
      console.log('Nuovo log ricevuto:', log);
      const currentLogs = this.logs.getValue();
      this.logs.next([log, ...currentLogs]);
    });

    this.socket.on('getProxyAndMockLogs', (logs: LogEntry[]) => {
      console.log('Log iniziali ricevuti:', logs);
      this.logs.next(logs);
    });

    this.socket.on('clearLogs', () => {
      console.log('Evento clearLogs ricevuto');
      this.logs.next([]);
    });

    // Log di tutti gli eventi ricevuti per debug
    this.socket.onAny((event, ...args) => {
      console.log('Evento ricevuto:', event, args);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Tentativo di riconnessione ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts);
    } else {
      console.error('Impossibile riconnettersi al WebSocket dopo', this.maxReconnectAttempts, 'tentativi');
    }
  }

  public getLogs() {
    return this.logs.asObservable();
  }

  public clearLogs(types?: ('PROXY' | 'MOCK' | 'SYSTEM')[]) {
    console.log('Invio richiesta clearLogs con types:', types);
    this.socket?.emit('clearLogs', types);
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const websocketService = new WebSocketService(); 