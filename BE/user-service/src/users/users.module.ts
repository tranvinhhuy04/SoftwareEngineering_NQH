import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { User, UserSchema } from './infrastructure/database/user.schema';
import { CreateUserUseCase } from './application/use-cases/createUser.usecase';
import { UserController } from './presentation/users.controller';
import { UserRepositoryImpl } from './infrastructure/respositories/user.repository.impl';
import { IUserRepository } from './domain/respositories/user.repository';
import { USER_REPOSITORY } from './constants';
import { DeliveryDetail, DeliveryDetailSchema } from './infrastructure/database/deliveryDetail.schema';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: DeliveryDetail.name, schema: DeliveryDetailSchema },  // ← thêm cái này
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
    CreateUserUseCase,
    {
      provide: USER_REPOSITORY,   // token là interface
      useClass: UserRepositoryImpl, // class thực tế
      
    },
    BcryptPasswordService,
  ],
  exports: [CreateUserUseCase],
})
export class UsersModule {}
