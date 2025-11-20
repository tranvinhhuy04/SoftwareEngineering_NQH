import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/users/constants';
import * as userRepository from 'src/users/domain/respositories/user.repository';
import { UserEntity } from 'src/users/domain/entities/user.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class DeletedUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: userRepository.IUserRepository,
  ) {}

  async execute(ID: string): Promise<any> {
    try {
      const users = await this.userRepo.findById(ID);
      if (!users) {
        throw new RpcException({
          statusCode: 404,
          message: 'No users found',
        });
      }
      await this.userRepo.remove(ID);
      return {
        message: `Get deleted users id ${ID} successfully`,
      }
    } catch (error) {
      throw new RpcException({
        statusCode: 500,
        message: `Error fetching users: ${error.message}`,
      });
    }
  }
}
