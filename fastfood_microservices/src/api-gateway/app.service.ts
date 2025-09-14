import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  private client: ClientProxy;

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'order-service', // hostname container order-service trong docker-compose
        port: 3001,            // port order-service
      },
    });
  }

  async pingOrder(): Promise<string> {
    return this.client.send({ cmd: 'pingOrder' }, {}).toPromise();
  }
}
