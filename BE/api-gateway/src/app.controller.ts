import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
  ) {}

  // API cho user-service
  @Post('users')
  createUser(@Body() userData: any) {
    return this.userClient.send({ cmd: 'create_user' }, userData);
  }

  @Get('users')
  getUsers() {
    return this.userClient.send({ cmd: 'get_users' }, {});
  }

  // API cho payment-service
  @Post('payments')
  createPayment(@Body() paymentData: any) {
    return this.paymentClient.send({ cmd: 'create_payment' }, paymentData);
  }

  @Get('payments')
  getPayments() {
    return this.paymentClient.send({ cmd: 'get_payments' }, {});
  }
}
