import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/users/constants';
import * as userRepository from 'src/users/domain/respositories/user.repository';
import { RpcException } from '@nestjs/microservices';
import { UserEntity } from 'src/users/domain/entities/user.entity';

@Injectable()
export class GetUserByEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: userRepository.IUserRepository,
  ) {}

  async execute(email: string): Promise<UserEntity> {
    if (!email) {
      throw new RpcException({
        statusCode: 400,
        message: 'User email is required',
      });
    }

    try {
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        throw new RpcException({
          statusCode: 404,
          message: `User not found with email: ${email}`,
        });
      }
      return user;
    } catch (error) {
      throw new RpcException({
        statusCode: 500,
        message: `Error fetching user: ${error.message}`,
      });
    }
  }
}
