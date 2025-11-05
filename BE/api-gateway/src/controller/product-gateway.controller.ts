import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';

@Controller('products')
export class ProductGatewayController {
  private readonly productUrl = 'http://localhost:4003/products';

  constructor(private readonly http: HttpService) {}

  @Post()
  async createProduct(@Body() data: any) {
    const res = await firstValueFrom(
      this.http.post(this.productUrl, data).pipe(timeout(5000)),
    );
    return res.data; // ✅ chỉ trả về JSON sạch
  }


  @Get()
  async getProducts() {
    const res = await firstValueFrom(
      this.http.get(this.productUrl).pipe(timeout(5000)),
    );
    return res.data;
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    const res = await firstValueFrom(
      this.http.get(`${this.productUrl}/${id}`).pipe(timeout(5000)),
    );
    return res.data;
  }

  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    const res = await firstValueFrom(
      this.http.put(`${this.productUrl}/${id}`, data).pipe(timeout(5000)),
    );
    return res.data;
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    const res = await firstValueFrom(
      this.http.delete(`${this.productUrl}/${id}`).pipe(timeout(5000)),
    );
    return res.data;
  }
}
