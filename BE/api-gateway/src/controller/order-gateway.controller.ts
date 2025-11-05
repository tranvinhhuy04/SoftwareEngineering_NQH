import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';

@Controller('orders')
export class OrderGatewayController {
  private readonly orderUrl = 'http://localhost:4002/orders';

  constructor(private readonly http: HttpService) {}

  @Post()
  async createOrder(@Body() data: any) {
    const res = await firstValueFrom(
      this.http.post(this.orderUrl, data).pipe(timeout(5000)),
    );
    return res.data; // ✅ chỉ trả về JSON sạch
  }


  @Get()
  async getOrders() {
    const res = await firstValueFrom(
      this.http.get(this.orderUrl).pipe(timeout(5000)),
    );
    return res.data;
  }
}
