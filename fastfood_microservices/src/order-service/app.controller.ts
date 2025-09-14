import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'pingOrder' })
  getPing(): string {
    return 'pong from order service';
  }
}
