import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping-order')
  async pingOrder(): Promise<string> {
    return this.appService.pingOrder();
  }
}
