/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyRequestDto } from './dto/proxy-request.dto';
import { MemoryJsonService } from 'src/memory-json/memory-json.service';
import { IMemoryJson, IMemoryJsonInput } from 'src/memory-json/entities/memory-json.entity';
import { HttpService } from '@nestjs/axios';
import * as https from 'https';
import { LogService } from 'src/log/log.service';

@Injectable()
export class ProxyService {
  constructor(
    private memoryService: MemoryJsonService,
    private http: HttpService,
    private logService: LogService,
  ) {}
  private readonly logger = new Logger(ProxyService.name);

  async proxy(url: string, request: Request, response: Response): Promise<any> {
    const targetUrl = url.split('/').slice(4).join('/');
    const requestData: IMemoryJsonInput = this.extractRequestData(targetUrl, request);
    //replace host with target host 
    requestData.headers.host = targetUrl.replace(/https?:\/\//, '').split('/')[0];
    const proxyRequestCleaned: IMemoryJsonInput = {...requestData};
    proxyRequestCleaned.headers = this.cleanRequestHeaders(proxyRequestCleaned.headers);
    const requestHash = this.memoryService.createHash(proxyRequestCleaned);

    const checkIfRequestExists = await this.memoryService.checkIfRequestExists(requestHash);
    let memoryJson: IMemoryJson | null = null;

    //log http request
    this.logService.logProxy(`Proxy request to ${proxyRequestCleaned.url}`, {
      method: proxyRequestCleaned.method,
      hash: requestHash,
      cached: checkIfRequestExists,
    });

    if(checkIfRequestExists){
      memoryJson = await this.memoryService.findOne(requestHash);
    }
    
    //se esiste ritorna il mock
    if (checkIfRequestExists && memoryJson && !memoryJson.bypass) {
      this.logService.logMock(`Serving cached response for ${proxyRequestCleaned.url}`, {
        statusCode: memoryJson.output.statusCode,
        delay: memoryJson.delay,
      });
      // manager delay
      setTimeout(() => {
        return response.status(memoryJson.output.statusCode).header(memoryJson.output.headers).send(memoryJson.output.body);
      }, memoryJson.delay);
    } else {
      //altrimenti chiamiamo il servizio esterno e mockiamo la risposta
      // Create an HTTPS agent that doesn't reject unauthorized certificates
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });

      try {
        const responseMock = await this.http[proxyRequestCleaned.method.toLowerCase()](proxyRequestCleaned.url, {
          headers: requestData.headers,
          data: proxyRequestCleaned.body,
          httpsAgent, // Add the HTTPS agent to bypass SSL validation
          maxRedirects: 5,
          // validateStatus: (status) => true, // Accept all status codes to properly handle errors
        }).toPromise();

        const memoryJson: IMemoryJson = {
          id: requestHash,
          input: proxyRequestCleaned,
          output: {
            headers: responseMock.headers,
            body: responseMock.data,
            statusCode: responseMock.status,
          },
          bypass: false,
          delay: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        // se non è un caso di bypass e non è già presente nel mock
        if (!checkIfRequestExists) {
          await this.memoryService.create(memoryJson);
        }
        this.logService.logMock(`Cached new response for ${proxyRequestCleaned.url}`, {
          statusCode: memoryJson.output.statusCode,
          responseSize: JSON.stringify(memoryJson.output.body).length,
        });
        return response.status(memoryJson.output.statusCode).header(memoryJson.output.headers).send(memoryJson.output.body);
      } catch (error) {
        //log http request
        this.logger.error(`Error proxying request: ${error.message}`, error.stack);
        this.logService.logProxy(`Error proxying request to ${proxyRequestCleaned.url}`, {
          error: error.message,
          stack: error.stack,
        }, 'error');
        if (error.response) {
          this.logger.error(`Response status: ${error.response.status}`);
          this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
          this.logger.error(`Response headers: ${JSON.stringify(error.response.headers)}`);
        }

        return response.status(500).send('Internal server error');
      }
    }
  }

  private extractRequestData(url: string, request: Request): ProxyRequestDto {
    return {
      url: url,
      method: request.method,
      headers: request.headers as Record<string, string>,
      params: request.query as Record<string, string>,
      body: request.body,
    };
  }

  private cleanRequestHeaders(headers: Record<string, string>): Record<string, string> {
    // Create a new headers object
    const cleanedHeaders: Record<string, string> = {};

    // Copy only safe headers, exclude problematic ones
    Object.entries(headers).forEach(([key, value]) => {
      // Skip headers that might cause issues with APIs
      if (
        key.toLowerCase() !== 'host' &&
        key.toLowerCase() !== 'connection' &&
        key.toLowerCase() !== 'content-length' &&
        key.toLowerCase() !== 'postman-token' &&
        !key.toLowerCase().startsWith('sec-') &&
        !key.toLowerCase().startsWith('proxy-') &&
        !key.toLowerCase().startsWith('PostmanRuntime') 
        && !value.toLowerCase().startsWith('xsrf')
      ) {
        cleanedHeaders[key] = value;
      }
    });

    // Add a standard User-Agent if none exists
    if (!cleanedHeaders['user-agent']) {
      cleanedHeaders['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
    }

    // Make sure we set a referer and origin that doesn't get blocked
    cleanedHeaders['accept'] = cleanedHeaders['accept'] || '*/*';

    return cleanedHeaders;
  }
}
