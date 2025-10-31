import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/users/constants';
import * as userRepository from 'src/users/domain/respositories/user.repository';
import { UserEntity } from 'src/users/domain/entities/user.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: userRepository.IUserRepository,
  ) {}

  async execute(): Promise<UserEntity[]> {
    try {
      const users = await this.userRepo.findAll();
      if (!users || users.length === 0) {
        throw new RpcException({
          statusCode: 404,
          message: 'No users found',
        });
      }
      return users;
    } catch (error) {
      throw new RpcException({
        statusCode: 500,
        message: `Error fetching users: ${error.message}`,
      });
    }
  }
}
