import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // 🔥 Load .env tự động
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 🔥 Mongoose kết nối bằng ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        dbName: 'auth_db',
      }),
      inject: [ConfigService],
    }),

    AuthModule,
  ],
})
export class AppModule {}
