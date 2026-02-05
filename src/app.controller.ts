import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('hello')
  sayHello(): string {
    return 'Hello, World';
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('greet')
  greet(@Query('name') name: string): string {
    return `Hello ${name || 'Guest'}!`;
  }
}
