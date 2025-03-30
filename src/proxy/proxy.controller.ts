import { All, Controller, Req, Res } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*') // 👈 Cattura qualsiasi rotta dinamica
  async proxy(@Req() request: Request, @Res() response: Response): Promise<any> {
    // 🔎 Recupera l'URL completa
    const fullUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;

    console.log('🔗 URL completa:', fullUrl);

    // Passa tutto al ProxyService
    return this.proxyService.proxy(fullUrl, request, response);
  }
}
