import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';
import { MemoryJsonModule } from '../memory-json/memory-json.module';
import { HttpModule } from '@nestjs/axios';
import { LogModule } from '../log/log.module';

@Module({
  imports: [
    MemoryJsonModule,
    HttpModule,
    LogModule // Import LogModule to make LogService available
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [ProxyService]
})
export class ProxyModule {}
