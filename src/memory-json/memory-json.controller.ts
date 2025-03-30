import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { MemoryJsonService } from './memory-json.service';
import { IMemoryJson } from './entities/memory-json.entity';

@Controller('memory-json')
export class MemoryJsonController {
  constructor(private readonly memoryJsonService: MemoryJsonService) {}

  @Post()
  create(@Body() createMemoryJsonDto: IMemoryJson) {
    return this.memoryJsonService.create(createMemoryJsonDto);
  }

  @Get()
  findAll() {
    return this.memoryJsonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memoryJsonService.findOne(id);
  }

  @Put(':hash')
  update(@Param('hash') hash: string, @Body() updateMemoryJsonDto: IMemoryJson) {
    return this.memoryJsonService.update(hash, updateMemoryJsonDto);
  }

  @Delete(':hash')
  remove(@Param('hash') hash: string) {
    return this.memoryJsonService.remove(hash);
  }
}
