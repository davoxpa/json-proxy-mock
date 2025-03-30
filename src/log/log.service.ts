/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateLogDto, LogType } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { LogGateway } from './log.gateway';

interface Log extends CreateLogDto {
  id: number;
  timestamp: Date;
}

@Injectable()
export class LogService {
  private logs: Log[] = [];
  private currentId = 1;

  constructor(
    @Inject(forwardRef(() => LogGateway))
    private readonly logGateway?: LogGateway
  ) {}

  create(createLogDto: CreateLogDto) {
    const log: Log = {
      id: this.currentId++,
      timestamp: createLogDto.timestamp || new Date(),
      level: createLogDto.level || 'info',
      ...createLogDto
    };
    this.logs.push(log);

    // Emit the new log to all connected clients
    this.emitLogEvent('newLog', log);

    return log;
  }

  // Helper method to emit events
  private emitLogEvent(event: string, data: any) {
    if (this.logGateway?.server) {
      this.logGateway.server.emit(event, data);
    }
  }

  findAll(filters?: { types?: LogType[]; level?: string; from?: Date; to?: Date }) {
    let filteredLogs = [...this.logs];

    if (filters?.types?.length) {
      filteredLogs = filteredLogs.filter(log => filters.types?.includes(log.type));
    }

    if (filters?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    if (filters?.from) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.from!);
    }

    if (filters?.to) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.to!);
    }

    return filteredLogs;
  }

  findOne(id: number) {
    return this.logs.find(log => log.id === id);
  }

  update(id: number, updateLogDto: UpdateLogDto) {
    const index = this.logs.findIndex(log => log.id === id);
    if (index === -1) return null;
    this.logs[index] = { ...this.logs[index], ...updateLogDto };
    return this.logs[index];
  }

  remove(id: number) {
    const index = this.logs.findIndex(log => log.id === id);
    if (index === -1) return false;
    this.logs.splice(index, 1);
    return true;
  }

  logSystem(message: string, details?: Record<string, unknown>, level: 'info' | 'warn' | 'error' | 'debug' = 'info') {
    return this.create({ message, details, level, type: LogType.SYSTEM });
  }

  logProxy(message: string, details?: Record<string, unknown>, level: 'info' | 'warn' | 'error' | 'debug' = 'info') {
    return this.create({ message, details, level, type: LogType.PROXY });
  }

  logMock(message: string, details?: Record<string, unknown>, level: 'info' | 'warn' | 'error' | 'debug' = 'info') {
    return this.create({ message, details, level, type: LogType.MOCK });
  }

  getSystemLogs() {
    return this.findAll({ types: [LogType.SYSTEM] });
  }

  getProxyLogs() {
    return this.findAll({ types: [LogType.PROXY] });
  }

  getMockLogs() {
    return this.findAll({ types: [LogType.MOCK] });
  }

  getProxyAndMockLogs() {
    return this.findAll({ types: [LogType.PROXY, LogType.MOCK] });
  }

  clearLogs(types?: LogType[]) {
    if (!types || types.length === 0) {
      this.logs = [];
      this.emitLogEvent('logsCleared', { all: true });
      return true;
    }
    this.logs = this.logs.filter(log => !types.includes(log.type));
    this.emitLogEvent('logsCleared', { types });
    return true;
  }
}
