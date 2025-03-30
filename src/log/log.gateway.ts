/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, WsResponse, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { LogService } from './log.service';
import { CreateLogDto, LogType } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class LogGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(LogGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => LogService))
    private readonly logService: LogService
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createLog')
  create(@MessageBody() createLogDto: CreateLogDto): WsResponse<unknown> {
    const result = this.logService.create(createLogDto);
    this.server.emit('newLog', result);
    return { event: 'createLog', data: result };
  }

  @SubscribeMessage('findAllLog')
  findAll(): WsResponse<unknown> {
    const result = this.logService.findAll();
    return { event: 'findAllLog', data: result };
  }

  @SubscribeMessage('findOneLog')
  findOne(@MessageBody() id: number): WsResponse<unknown> {
    const result = this.logService.findOne(id);
    return { event: 'findOneLog', data: result };
  }

  @SubscribeMessage('updateLog')
  update(@MessageBody() updateLogDto: UpdateLogDto): WsResponse<unknown> {
    const result = this.logService.update(updateLogDto.id, updateLogDto);
    return { event: 'updateLog', data: result };
  }

  @SubscribeMessage('removeLog')
  remove(@MessageBody() id: number) {
    return this.logService.remove(id);
  }

  @SubscribeMessage('getSystemLogs')
  getSystemLogs(): WsResponse<unknown> {
    const result = this.logService.getSystemLogs();
    return { event: 'getSystemLogs', data: result };
  }

  @SubscribeMessage('getProxyLogs')
  getProxyLogs(): WsResponse<unknown> {
    const result = this.logService.getProxyLogs();
    return { event: 'getProxyLogs', data: result };
  }

  @SubscribeMessage('getMockLogs')
  getMockLogs(): WsResponse<unknown> {
    const result = this.logService.getMockLogs();
    return { event: 'getMockLogs', data: result };
  }

  @SubscribeMessage('getProxyAndMockLogs')
  getProxyAndMockLogs(): WsResponse<unknown> {
    const result = this.logService.getProxyAndMockLogs();
    return { event: 'getProxyAndMockLogs', data: result };
  }

  @SubscribeMessage('clearLogs')
  clearLogs(@MessageBody() types?: LogType[]): WsResponse<unknown> {
    const result = this.logService.clearLogs(types);
    return { event: 'clearLogs', data: result };
  }

  @SubscribeMessage('subscribeLogs')
  subscribeLogs(client: Socket): WsResponse<unknown> {
    client.join('logs-room');
    this.logger.log(`Client ${client.id} subscribed to logs`);
    const allLogs = this.logService.findAll();
    return { event: 'allLogs', data: allLogs };
  }

  @SubscribeMessage('unsubscribeLogs')
  unsubscribeLogs(client: Socket): WsResponse<unknown> {
    client.leave('logs-room');
    this.logger.log(`Client ${client.id} unsubscribed from logs`);
    return { event: 'unsubscribedLogs', data: true };
  }
}
