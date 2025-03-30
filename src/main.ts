import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as path from 'path';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configure the template engine
  app.setViewEngine('ejs');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // comunico le informazioni come porta, indiriizzo ip e cartella dei mocks
  const dir = path.resolve(process.env.MOCKDIR ?? 'mocks');
  console.log('http://localhost:' + process.env.PORT);
  console.log('mock position: ' + dir);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
