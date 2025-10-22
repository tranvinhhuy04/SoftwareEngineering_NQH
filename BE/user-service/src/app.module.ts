import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersModule } from './users/users.module';
import { UserLoggerService } from './users/common/logger/custom-logger.service';
import { CustomerProfileSql } from './users/infrastructure/database/sql/customerProfile.entity';
import { DeliveryProfileSql } from './users/infrastructure/database/sql/deliveryProfile.entity';
import { StaffProfileSql } from './users/infrastructure/database/sql/staffProfile.entity';
import { UserSql } from './users/infrastructure/database/sql/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // ✅ Nạp biến môi trường toàn cục
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ✅ Kết nối MongoDB bằng .env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://localhost:27017/fastbite_store',
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],     
      inject: [ConfigService],  
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT') || '3306', 10),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [
          UserSql,
          StaffProfileSql,
          CustomerProfileSql,   // ✅ PHẢI có dòng này
          DeliveryProfileSql,
        ],
        synchronize: true,
      }),
    }),

    // ✅ Kết nối RabbitMQ bằng .env
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI') || 'amqp://localhost:5672'],
            queue: configService.get<string>('RABBITMQ_MAIN_QUEUE') || 'main_queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),

    // ✅ Gắn UsersModule
    UsersModule,
  ],

  providers: [UserLoggerService],
  exports: [UserLoggerService],
})
export class AppModule {}
