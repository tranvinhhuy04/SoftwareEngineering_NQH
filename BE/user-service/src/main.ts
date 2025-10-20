import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { UserLoggerService } from './users/common/logger/custom-logger.service';

async function bootstrap() {
  const isDev = process.env.NODE_ENV !== 'production';
  const userLogger = new UserLoggerService();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://localhost:5672'],
      queue: 'users_queue',
      queueOptions: { durable: false },
    },
    logger: isDev
      ? ['log', 'debug', 'warn', 'error', 'verbose']
      : ['log', 'warn', 'error'],
  });

  app.useLogger(userLogger);

  await app.listen();
  userLogger.log('✅ User-Service is running and connected to RabbitMQ...');
}

bootstrap();
