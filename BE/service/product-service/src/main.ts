import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Khởi động HTTP server để test qua Postman
  const app = await NestFactory.create(AppModule);
  await app.listen(4003);
  Logger.log('🚀 Product HTTP service running on port 4003');

  // Kết nối Microservice (RabbitMQ)
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://localhost:5672'],
      queue: 'products_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  Logger.log('✅ Product service is running and listening to products_queue');
}

bootstrap();
