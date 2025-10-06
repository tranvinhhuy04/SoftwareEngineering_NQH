import { Controller } from "@nestjs/common";
import { CreateUserUseCase } from "../application/use-cases/createUser.usecase";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateUserDto } from "../application/dto/user/create-user.dto";
import { UserEntity } from "../domain/entities/user.entity";
import { GetAllUsersUseCase } from "../application/use-cases/getAllUsers.usecase";
import { GetUserByIdUseCase } from "../application/use-cases/getUserById.usecase";
import { SearchUserUseCase } from "../application/use-cases/searchUser.usecase";
import { GetUserByEmailUseCase } from "../application/use-cases/getUserByEmail.usecase";
import { DeletedUsersUseCase } from "../application/use-cases/deleteUser.usecase";

@Controller()
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly searchUserUseCase: SearchUserUseCase,
    private readonly getDeletedUsersUseCase: DeletedUsersUseCase,
  
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

  @MessagePattern({ cmd: 'get_user_by_email' })
  async getUserByEmail(@Payload() email: string): Promise<UserEntity> {
    return this.getUserByEmailUseCase.execute(email);
  }

  @MessagePattern({ cmd: 'search_users' })
  async searchUsers(@Payload() filters: any): Promise<UserEntity[]> {
    return this.searchUserUseCase.execute(filters);
  }

  @MessagePattern({ cmd: 'deleted_user' })
  async getDeletedUsers(@Payload() userId: string): Promise<any> {
    return this.getDeletedUsersUseCase.execute(userId);
  }

}