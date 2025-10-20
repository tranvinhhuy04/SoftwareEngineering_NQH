import { Controller, Get, Post, Put, Delete, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy, // ✅ thêm
  ) {}

  // ===== USER SERVICE =====
  @Post('users')
  createUser(@Body() userData: any) {
    return this.userClient.send({ cmd: 'create_user' }, userData);
  }

  @Get('users')
  getUsers() {
    return this.userClient.send({ cmd: 'get_users' }, {});
  }

  // ===== PAYMENT SERVICE =====
  @Post('payments')
  createPayment(@Body() paymentData: any) {
    return this.paymentClient.send({ cmd: 'create_payment' }, paymentData);
  }

  @Get('payments')
  getPayments() {
    return this.paymentClient.send({ cmd: 'get_payments' }, {});
  }

  // ===== PRODUCT SERVICE =====
  @Post('products')
  createProduct(@Body() data: any) {
    return this.productClient.send({ cmd: 'create_product' }, data);
  }

  @Get('products')
  getProducts() {
    return this.productClient.send({ cmd: 'get_products' }, {});
  }

  @Get('products/:id')
  getProduct(@Param('id') id: number) {
    return this.productClient.send({ cmd: 'get_product' }, { id });
  }

  @Put('products/:id')
  updateProduct(@Param('id') id: number, @Body() data: any) {
    return this.productClient.send({ cmd: 'update_product' }, { id, ...data });
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: number) {
    return this.productClient.send({ cmd: 'delete_product' }, { id });
  }
}
