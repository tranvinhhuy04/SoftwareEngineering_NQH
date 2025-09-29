import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    PaymentsModule,
  ],
})
export class AppModule {}
