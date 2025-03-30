import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogGateway } from './log.gateway';

@Module({
  providers: [LogGateway, LogService],
  exports: [LogService]
})
export class LogModule {}
