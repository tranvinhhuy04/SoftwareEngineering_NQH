import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { PaymentsModule } from './payments/payments.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(PaymentsModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@rabbitmq:5672'], // dùng tên container RabbitMQ
      queue: 'payments_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.listen();
  console.log('Payment service is listening...');
}
bootstrap();
