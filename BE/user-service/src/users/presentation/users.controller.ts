import { Controller } from "@nestjs/common";
import { CreateUserUseCase } from "../application/use-cases/createUser.usecase";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateUserDto } from "../application/dto/user/create-user.dto";
import { UserEntity } from "../domain/entities/user.entity";

@Controller()
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() dto: CreateUserDto): Promise<UserEntity> {
    return this.createUserUseCase.execute(dto);
  }
}