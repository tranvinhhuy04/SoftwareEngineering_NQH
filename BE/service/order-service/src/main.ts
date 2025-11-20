import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // 🚀 Khởi tạo HTTP Server (để test qua Postman)
  const app = await NestFactory.create(AppModule);

  // 🚀 Khởi tạo Microservice (RabbitMQ)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://localhost:5672'],
      queue: 'orders_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(4002);
  console.log('✅ Order service is running on port 4002 & listening to orders_queue');
}

bootstrap();
