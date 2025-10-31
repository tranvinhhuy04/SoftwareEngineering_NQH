import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('orders')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post()
  async createOrder(
    @Body() data: { productId: string; quantity: number; userId: number },
  ) {
    return this.appService.createOrder(data);
  }

  @Get()
  async getOrders() {
    return this.appService.getAllOrders();
  }
}
