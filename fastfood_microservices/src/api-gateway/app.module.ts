import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsProviderModule } from './clients.module';

@Module({
  imports: [ClientsProviderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
