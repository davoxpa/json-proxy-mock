/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as marked from 'marked';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root(@Res() res: Response) {
    try {
      // Read the markdown file with project instructions
      const readmePath = path.join(process.cwd(), 'WELCOME.md');
      const readmeContent = fs.readFileSync(readmePath, 'utf8');

      // Convert markdown to HTML
      const htmlContent = marked.parse(readmeContent);

      // Render the view with the markdown content converted to HTML
      res.render(this.appService.getViewName(), {
        message: 'Istruzioni',
        content: htmlContent
      });
    } catch (error) {
      // Fallback if README.md doesn't exist
      res.render(this.appService.getViewName(), {
        message: 'Welcome to json-proxy-mock',
        content: '<p>README.md file not found. Please create one with project usage instructions.</p>'
      });
    }
  }
}
