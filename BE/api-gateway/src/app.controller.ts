import { Controller, Get, Post, Body, Inject, Param, Delete } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
  ) {}

  // API cho user-service
  @Post('users/create')
  createUser(@Body() userData: any) {
    return this.userClient.send({ cmd: 'create_user' }, userData);
  }

  @Get('users/get_all')
  getAllUsers() {
    return this.userClient.send({ cmd: 'get_all_users' }, {});
  }

  @Get('users/get_id/:id')
  getUserById(@Param('id') id: string) {
    return this.userClient.send({ cmd: 'get_user_by_id' }, id);
  }

  @Get('users/get_email/:email')
  getUserByEmail(@Param('email') email: string) {
    return this.userClient.send({ cmd: 'get_user_by_email' }, email);
  }
  
  @Delete('users/delete/:id')
  deleteUser(@Param('id') id: string) {
    return this.userClient.send({ cmd: 'deleted_user' }, id);
  }

}
