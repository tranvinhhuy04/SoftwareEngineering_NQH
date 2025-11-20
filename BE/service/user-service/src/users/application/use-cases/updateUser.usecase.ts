import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import * as userRepository_1 from "src/users/domain/respositories/user.repository";
import { USER_REPOSITORY } from "src/users/constants";
import { UpdateUserDto } from "src/users/application/dto/user/update-user.dto";
import { UserMapper } from "src/users/infrastructure/mappers/user.mapper";
import { UserEntity } from "src/users/domain/entities/user.entity";

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: userRepository_1.IUserRepository,  // ✅ inject bằng token, không inject interface trực tiếp
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) throw new NotFoundException(`User with ID=${id} not found`);

    const updatedUser = UserMapper.mergeEntityWithUpdateDto(existingUser, dto);
    return this.userRepository.update(id, updatedUser);
  }
}
