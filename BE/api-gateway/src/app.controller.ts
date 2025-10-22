import { Controller, Get, Post, Body, Inject, Param, Delete, Query, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
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

  @Post('users/search')
  searchUsers(@Body() filters: any) {
    const parsedFilters = {
      ...filters,
      page: parseInt(filters.page) || 1,
      limit: parseInt(filters.limit) || 10,
    };
    return this.userClient.send({ cmd: 'search_users' }, parsedFilters);
  }

  @Put('users/update/:id')
  updateUser(@Param('id') id: string, @Body() dto: any) {
    return this.userClient.send({ cmd: 'update_user' }, { id, dto });
  }

  @Post('auth/register')
  registerUser(@Body() registerData: any) {
    
    console.log('📤 Sending register request to AuthService', registerData);
    // ✅ Gửi message đến AuthService
    return this.authClient.send({ cmd: 'register' }, registerData);
  }
}
