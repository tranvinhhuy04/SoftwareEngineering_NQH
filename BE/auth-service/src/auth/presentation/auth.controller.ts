import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserUseCase } from 'src/auth/application/use-cases/register-user.usecase';

@Controller()
export class AuthController {
  constructor(private readonly registerUC: RegisterUserUseCase) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() dto: { userId: string; email: string; password: string; role: string }) {
    Logger.debug(JSON.stringify(dto, null, 2))
    return this.registerUC.execute(dto);
  }
}
