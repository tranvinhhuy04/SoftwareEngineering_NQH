import { Controller, Post, Body, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserUseCase } from '../application/use-cases/register-user.usecase';
import { LoginUseCase } from '../application/use-cases/login.usecase';
import { RegisterUserDto } from '../application/dto/register-user.dto';
import { LoginDto } from '../application/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUC: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase, 
) {}

  // 👉 REST API
  @Post('register')
  async httpRegister(@Body() dto: RegisterUserDto) {
    Logger.debug('HTTP Register DTO: ' + JSON.stringify(dto));
    return this.registerUC.execute(dto);
  }

  // 👉 Microservice Pattern
  @MessagePattern({ cmd: 'register' })
  async register(@Payload() dto: RegisterUserDto) {
    Logger.debug('RMQ Register DTO: ' + JSON.stringify(dto));
    return this.registerUC.execute(dto);
  }

  @Post('login')
  async httpLogin(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @MessagePattern({ cmd: 'login_user' })
  async login(@Payload() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }
}
