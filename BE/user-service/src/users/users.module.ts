import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { User, UserSchema } from './infrastructure/database/user.schema';
import { CreateUserUseCase } from './application/use-cases/createUser.usecase';
import { UserController } from './presentation/users.controller';
import { UserRepositoryImpl } from './infrastructure/respositories/user.repository.impl';
import { USER_REPOSITORY } from './constants';
import { DeliveryProfile, DeliveryProfileSchema } from './infrastructure/database/deliveryProfile.schema';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';
import { StaffProfile, StaffProfileSchema } from './infrastructure/database/staffProfile.schema';
import { CustomerProfile, CustomerProfileSchema } from './infrastructure/database/customerProfile.schema';
import { GetAllUsersUseCase } from './application/use-cases/getAllUsers.usecase';
import { GetUserByIdUseCase } from './application/use-cases/getUserById.usecase';
import { SearchUserUseCase } from './application/use-cases/searchUser.usecase';
import { GetUserByEmailUseCase } from './application/use-cases/getUserByEmail.usecase';
import { DeletedUsersUseCase } from './application/use-cases/deleteUser.usecase';
import { UpdateUserUseCase } from './application/use-cases/updateUser.usecase';

@Module({ 
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: DeliveryProfile.name, schema: DeliveryProfileSchema }, 
      { name: StaffProfile.name, schema: StaffProfileSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema }
    ]),

    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI as string],
          queue: 'users_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY,   // token là interface
      useClass: UserRepositoryImpl, // class thực tế
    },
    BcryptPasswordService,
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    GetUserByEmailUseCase,
    SearchUserUseCase,
    DeletedUsersUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
  ],
  exports: [CreateUserUseCase, UpdateUserUseCase, GetUserByIdUseCase, GetUserByEmailUseCase, SearchUserUseCase, DeletedUsersUseCase],
})
export class UsersModule {}
