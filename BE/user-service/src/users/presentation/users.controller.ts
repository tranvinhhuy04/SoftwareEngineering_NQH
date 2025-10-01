import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from '../infrastructure/services/users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @MessagePattern({ cmd: 'get_users' })
  getUsers() {
    return this.usersService.findAll();
  }
}
