/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IMemoryJson, IMemoryJsonInput } from './entities/memory-json.entity';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class MemoryJsonService {
  private readonly logger = new Logger(MemoryJsonService.name);
  private readonly mocksDir: string;

  constructor(private configService: ConfigService) {
    this.mocksDir = this.configService.get('MOCKDIR') || 'mocks';
    void this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.mocksDir);
    } catch {
      this.logger.log(`Creating mocks directory: ${this.mocksDir}`);
      await fs.mkdir(this.mocksDir, { recursive: true });
    }
  }

  createHash(input: IMemoryJsonInput): string {
    const objectToHash = {
      url: input.url,
      headers: input.headers ? Object.keys(input.headers).sort() : [],
      body: input.body
    };
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(objectToHash));

    return hash.digest('hex');
  }

  checkIfRequestExists(hash: string): Promise<boolean> {
    return fs
      .access(path.join(this.mocksDir, `${hash}.json`))
      .then(() => true)
      .catch(() => false);
  }

  async create(createMemoryJsonDto: IMemoryJson): Promise<IMemoryJson> {
    const hash = this.createHash(createMemoryJsonDto.input);
    const now = new Date();
    const memoryJson: IMemoryJson = {
      ...createMemoryJsonDto,
      bypass: createMemoryJsonDto.bypass ?? false,
      createdAt: now,
      updatedAt: now
    };
    const filename = `${hash}.json`;
    await fs.writeFile(path.join(this.mocksDir, filename), JSON.stringify(memoryJson, null, 2));
    return memoryJson;
  }

  async findAll(): Promise<IMemoryJson[]> {
    const files = await fs.readdir(this.mocksDir);
    return Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const content = await fs.readFile(path.join(this.mocksDir, file), 'utf8');
          const parsedContent = JSON.parse(content) as IMemoryJson;
          return parsedContent;
        })
    );
  }

  async findOne(hash: string): Promise<IMemoryJson> {
    try {
      const content = await fs.readFile(path.join(this.mocksDir, `${hash}.json`), 'utf8');
      return JSON.parse(content) as IMemoryJson;
    } catch {
      throw new NotFoundException(`Memory JSON with ID ${hash} not found`);
    }
  }

  async update(hashTarget: string, updateMemoryJsonDto: IMemoryJson): Promise<IMemoryJson> {
    // change file name with new hash
    const newHash = this.createHash(updateMemoryJsonDto.input);
    console.log('newHash', newHash);
    console.log('input', updateMemoryJsonDto.input);
    const newFilePath = path.join(this.mocksDir, `${newHash}.json`);
    const filePathDelete = path.join(this.mocksDir, `${hashTarget}.json`);
    try {
      const fileExists = await fs.readFile(filePathDelete, 'utf8');
      const existing = JSON.parse(fileExists) as IMemoryJson;
      const updated = {
        ...existing,
        ...updateMemoryJsonDto,
        id: newHash,
        updatedAt: new Date()
      };
      // delete old file
      await fs.unlink(filePathDelete);
      // write new file
      await fs.writeFile(newFilePath, JSON.stringify(updated, null, 2));
      return updated;
    } catch (error) {
      console.log(error);
      throw new NotFoundException(`Memory JSON with ID ${hashTarget} not found`);
    }
  }

  async remove(hash: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.mocksDir, `${hash}.json`));
    } catch {
      throw new NotFoundException(`Memory JSON with ID ${hash} not found`);
    }
  }

  async archiveLogs(logData: Record<string, any>, category: string = 'general'): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const logFileName = `log_${category}_${timestamp}.json`;
      const logFilePath = path.join(this.mocksDir, 'logs');

      // Ensure logs directory exists
      try {
        await fs.access(logFilePath);
      } catch {
        this.logger.log(`Creating logs directory: ${logFilePath}`);
        await fs.mkdir(logFilePath, { recursive: true });
      }

      // Write log file
      await fs.writeFile(path.join(logFilePath, logFileName), JSON.stringify({ timestamp: new Date(), data: logData }, null, 2));

      this.logger.debug(`Log archived at: ${logFileName}`);
    } catch (error) {
      this.logger.error(`Failed to archive log: ${error.message}`);
    }
  }
}
