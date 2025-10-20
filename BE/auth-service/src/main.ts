import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AuthLoggerService } from './auth/common/logger/auth-logger.service';

async function bootstrap() {
  const isDev = process.env.NODE_ENV !== 'production';
  const authLogger = new AuthLoggerService();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://localhost:5672'],
      queue: 'auth_queue',
      queueOptions: { durable: false },
    },
    logger: isDev
      ? ['log', 'debug', 'warn', 'error', 'verbose']
      : ['log', 'warn', 'error'],
  });

  app.useLogger(authLogger);

  await app.listen();
  console.log('Auth microservice is listening...');
  authLogger.log('✅ Auth-Service is running and connected to RabbitMQ...');
}

bootstrap();
