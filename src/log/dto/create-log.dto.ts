export enum LogType {
  SYSTEM = 'system',
  PROXY = 'proxy',
  MOCK = 'mock'
}

export class CreateLogDto {
  message: string;
  type: LogType;
  timestamp?: Date;
  details?: any;
  level?: 'info' | 'warn' | 'error' | 'debug';
}
