import { Controller, Post, Get, Param, Body, Patch } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';

@Controller('payments')
export class PaymentGatewayController {
  private readonly paymentUrl = 'http://localhost:4008/payment';

  constructor(private readonly http: HttpService) {}

  @Post()
  async createPayment(@Body() data: any) {
    const res = await firstValueFrom(
      this.http.post(this.paymentUrl, data).pipe(timeout(5000)),
    );
    return res.data; // ✅ chỉ trả về JSON sạch
  }


  @Get()
  async getAllPayments() {
    const res = await firstValueFrom(
      this.http.get(this.paymentUrl).pipe(timeout(5000)),
    );
    return res.data;
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() data: any) {
    const res = await firstValueFrom(
      this.http.patch(`${this.paymentUrl}/${id}/status`, data).pipe(timeout(5000)),
    );
    return res.data;
  }

}
