import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { AuthLoggerService } from './auth/common/logger/auth-logger.service';

@Module({
  imports: [
    // Load .env toàn cục
    ConfigModule.forRoot({ isGlobal: true }),

    // Kết nối MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGO_URI');
        return { uri: mongoUri }; 
      },
    }),

    // Kết nối RabbitMQ
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitUri =
            configService.get<string>('RABBITMQ_URI') || 'amqp://localhost:5672';

          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitUri], // phải là string[]
              queue: 'main_queue',
              queueOptions: { durable: true },
            },
          };
        },
      },
    ]),

    AuthModule,
  ],
  providers: [AuthLoggerService],
  exports: [AuthLoggerService],
})
export class AppModule {}
