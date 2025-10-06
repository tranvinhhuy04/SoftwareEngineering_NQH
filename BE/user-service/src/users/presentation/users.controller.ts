import { Controller } from "@nestjs/common";
import { CreateUserUseCase } from "../application/use-cases/createUser.usecase";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateUserDto } from "../application/dto/user/create-user.dto";
import { UserEntity } from "../domain/entities/user.entity";
import { GetAllUsersUseCase } from "../application/use-cases/getAllUsers.usecase";
import { GetUserByIdUseCase } from "../application/use-cases/getUserById.usecase";
import { SearchUserUseCase } from "../application/use-cases/searchUser.usecase";

@Controller()
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly searchUserUseCase: SearchUserUseCase,
  
  ) {}

  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() dto: CreateUserDto): Promise<UserEntity> {
    return this.createUserUseCase.execute(dto);
  }

  @MessagePattern({ cmd: 'get_all_users' })
  async getAllUsers(): Promise<UserEntity[]> {
    return this.getAllUsersUseCase.execute();
  }

  @MessagePattern({ cmd: 'get_user_by_id' })
  async getUserById(@Payload() userId: string): Promise<UserEntity> {
    return this.getUserByIdUseCase.execute(userId);
  }

  
}