import { Module } from '@nestjs/common';
import { MemoryJsonService } from './memory-json.service';
import { MemoryJsonController } from './memory-json.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [MemoryJsonController],
  providers: [MemoryJsonService],
  exports: [MemoryJsonService]
})
export class MemoryJsonModule {}
