import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Payment, PaymentSchema } from './payment.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // ✅ Load file .env toàn cục
    ConfigModule.forRoot({ isGlobal: true }),

    // ✅ Kết nối MongoDB
    MongooseModule.forRoot(process.env.MONGO_URI!, {
      dbName: process.env.DB_NAME,
    }),

    // ✅ Khai báo model Payment
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),

    // ✅ Kết nối RabbitMQ
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || 'amqp://localhost:5672'],
          queue: 'orders_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
