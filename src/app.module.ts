import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyModule } from './proxy/proxy.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LogModule } from './log/log.module';

@Module({
  imports: [
    ProxyModule,
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'admin'),
      serveRoot: '/admin'
    }),
    LogModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
