import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

// 🧩 Import adapter, services, controller, use case
import { UserServiceRmqAdapter } from './infrastructure/adapters/user-service-rmq.adapter';
import { RegisterUserUseCase } from './application/use-cases/register-user.usecase';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';

// 🧩 Constants
import { USER_SERVICE } from './contact/services/services';
import { AuthController } from './presentation/auth.controller';
import { AuthUserSchema,AuthUserSchemaDef } from './infrastructure/database/authUser.schema';
import { UserAuthMongoRepository } from './infrastructure/repositories/auth.respository.imp';
import { LoginUseCase } from './application/use-cases/login.usecase';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // 🧱 Kết nối MongoDB (AuthService database)
    MongooseModule.forFeature([
      { name: AuthUserSchema.name, schema: AuthUserSchemaDef },
    ]),

    // 🧩 Kết nối tới UserService qua RabbitMQ
    ClientsModule.register([
      {
        name: USER_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || 'amqp://localhost:5672'],
          queue: 'users_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],

  controllers: [AuthController],

  providers: [
    // 🧩 Repository interface implementation
    {
      provide: 'IUserAuthRepository',
      useClass: UserAuthMongoRepository, // ✅ ánh xạ đúng repo
    },

    // 🧩 Hash Service (mã hóa mật khẩu)
    {
      provide: 'IPasswordHashService',
      useClass: BcryptPasswordService,
    },

    // 🧩 Adapter gửi request sang UserService
    {
      provide: 'IUserServiceAdapter',
      useClass: UserServiceRmqAdapter,
    },
    {
      provide: 'ITokenService',
      useClass: JwtTokenService,
    },

    // 🧩 Use Case
    RegisterUserUseCase,
    LoginUseCase
  ],

  exports: ['IUserServiceAdapter'],
})
export class AuthModule {}
