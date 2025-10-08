import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './presentation/auth.controller';
import { AUTH_REPOSITORY } from './constants';
import { AuthRepositoryImpl } from './infrastructure/repositories/auth.respository.imp';

@Module({ 
  imports: [
    MongooseModule.forFeature([
    ]),

    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI as string],
          queue: ' auth_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepositoryImpl,
    },
  ],
  exports: [],
})

export class AuthModule {}