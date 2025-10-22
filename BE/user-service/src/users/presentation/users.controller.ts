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
import { UpdateUserUseCase } from "../application/use-cases/updateUser.usecase";
import { UpdateUserDto } from "../application/dto/user/update-user.dto";

@Controller()
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly searchUserUseCase: SearchUserUseCase,
    private readonly getDeletedUsersUseCase: DeletedUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  
  ) {}

  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() dto: CreateUserDto): Promise<any> {
    console.log('📩 Received create_user message:', dto);

    const createdUser = await this.createUserUseCase.execute(dto);

    // ✅ Đảm bảo trả về _id Mongo thật
    return {
      _id: createdUser.get_Id(),   // Mongo ObjectId
      ID: createdUser.ID,          // ID nghiệp vụ
      email: createdUser.email,
      userType: createdUser.userType,
      name: createdUser.name,
    };
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
  
  @MessagePattern({ cmd: 'update_user' })
  async updateUser(
    @Payload() data: { id: string; dto: UpdateUserDto }
 ): Promise<UserEntity> {
    const { id, dto } = data;
    return await this.updateUserUseCase.execute(id, dto);
  }
}