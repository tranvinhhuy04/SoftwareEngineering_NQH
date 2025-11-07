import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // ✅ Tạo app HTTP
  const app = await NestFactory.create(AppModule);

  // ✅ Kết nối Microservice (RabbitMQ)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://localhost:5672'],
      queue: 'payments_queue',
      queueOptions: { durable: false },
    },
    
  });

  // ✅ Khởi động cả HTTP + Microservice
  await app.startAllMicroservices();
  await app.listen(4008);

  console.log(`🚀 Payment service is running on http://localhost:4008`);
}
bootstrap();
