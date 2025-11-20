import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('payment')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post()
  async createPayment(@Body() data: any) {
    return await this.appService.createPayment(data);
  }

  @Get()
  getAllPayments() {
    return this.appService.getAll();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.appService.updateStatus(id, status);
  }
}
