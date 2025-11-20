import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/users/constants';
import * as userRepository from 'src/users/domain/respositories/user.repository';
import { RpcException } from '@nestjs/microservices';
import { UserType } from 'src/users/domain/enum/user-type.enum';
import { UserActive } from 'src/users/domain/enum/user-active.enum';
import { UserEntity } from 'src/users/domain/entities/user.entity';

interface SearchUserFilter {
  name?: string;
  email?: string;
  userType?: UserType;
  active?: UserActive;
  page?: number;
  limit?: number;
}

@Injectable()
export class SearchUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: userRepository.IUserRepository,
  ) {}

  async execute(filters: SearchUserFilter): Promise<UserEntity[]> {
    try {
      const users = await this.userRepo.findByFilters(filters);

      if (!users || users.length === 0) {
        throw new RpcException({
          statusCode: 404,
          message: 'No users match the given filters',
        });
      }

      return users;
    } catch (error) {
      throw new RpcException({
        statusCode: 500,
        message: `Error searching users: ${error.message}`,
      });
    }
  }
}
