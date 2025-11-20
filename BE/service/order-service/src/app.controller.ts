import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.appService.getOrderById(id);
  }
}
