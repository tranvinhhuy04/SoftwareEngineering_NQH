import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { UserController } from './presentation/users.controller';
import { UserRepositoryImpl } from './infrastructure/respositories/user.repository.impl';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';

import { CreateUserUseCase } from './application/use-cases/createUser.usecase';
import { GetAllUsersUseCase } from './application/use-cases/getAllUsers.usecase';
import { GetUserByIdUseCase } from './application/use-cases/getUserById.usecase';
import { SearchUserUseCase } from './application/use-cases/searchUser.usecase';
import { GetUserByEmailUseCase } from './application/use-cases/getUserByEmail.usecase';
import { DeletedUsersUseCase } from './application/use-cases/deleteUser.usecase';
import { UpdateUserUseCase } from './application/use-cases/updateUser.usecase';
import { USER_REPOSITORY } from './constants';

import { User, UserSchema } from './infrastructure/database/mongo/user.schema';
import { DeliveryProfile, DeliveryProfileSchema } from './infrastructure/database/mongo/deliveryProfile.schema';
import { StaffProfile, StaffProfileSchema } from './infrastructure/database/mongo/staffProfile.schema';
import { CustomerProfile, CustomerProfileSchema } from './infrastructure/database/mongo/customerProfile.schema';

import { UserSql } from './infrastructure/database/sql/user.entity';
import { StaffProfileSql} from './infrastructure/database/sql/staffProfile.entity';
import { CustomerProfileSql } from './infrastructure/database/sql/customerProfile.entity';
import { DeliveryProfileSql } from './infrastructure/database/sql/deliveryProfile.entity';
import { UserRepositorySql } from './infrastructure/respositories/user.repository.sql';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: DeliveryProfile.name, schema: DeliveryProfileSchema },
      { name: StaffProfile.name, schema: StaffProfileSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
    ]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<'mysql'>('DB_TYPE') || 'mysql',
        host: config.get<string>('DB_HOST') || 'localhost',
        port: parseInt(config.get<string>('DB_PORT') || '3306', 10),
        username: config.get<string>('DB_USERNAME') || 'root',
        password: config.get<string>('DB_PASSWORD') || '',
        database: config.get<string>('DB_DATABASE') || 'fastbite_store',
        entities: [UserSql, StaffProfileSql, CustomerProfileSql, DeliveryProfileSql],
        synchronize: true,
      }),
    }),

    TypeOrmModule.forFeature([
      UserSql,
      CustomerProfileSql,
      StaffProfileSql,
      DeliveryProfileSql,
    ]),

    // RabbitMQ
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URI') || 'amqp://localhost:5672'],
            queue: config.get<string>('RABBITMQ_USER_QUEUE') || 'users_queue',
            queueOptions: { durable: false },
          },
        }),
      },
    ]),
  ],

  controllers: [UserController],

  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: process.env.DB_TYPE === 'mysql'
        ? UserRepositorySql
        : UserRepositoryImpl,
    },
    BcryptPasswordService,
    CreateUserUseCase,
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    GetUserByEmailUseCase,
    SearchUserUseCase,
    DeletedUsersUseCase,
    UpdateUserUseCase,
  ],

  exports: [
    CreateUserUseCase,
    UpdateUserUseCase,
    GetUserByIdUseCase,
    GetUserByEmailUseCase,
    SearchUserUseCase,
    DeletedUsersUseCase,
  ],
})
export class UsersModule {}

