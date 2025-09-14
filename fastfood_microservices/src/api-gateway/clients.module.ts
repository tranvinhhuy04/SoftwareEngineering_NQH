import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.TCP,
        options: { host: 'order-service', port: 4001 },
      },
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.TCP,
        options: { host: 'payment-service', port: 4002 },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: { host: 'product-service', port: 4003 },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: { host: 'user-service', port: 4004 },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class ClientsProviderModule {}
