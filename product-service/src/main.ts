import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://localhost:5672'],
      queue: 'products_queue', // ✅ phải trùng với gateway
      queueOptions: { durable: false },
    },
  });

  await app.listen();
  console.log('✅ Product service is running and listening to products_queue');
}
bootstrap();
