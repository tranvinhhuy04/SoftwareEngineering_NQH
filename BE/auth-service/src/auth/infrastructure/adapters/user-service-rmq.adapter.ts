import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { USER_SERVICE } from 'src/auth/contact/services/services';
import { lastValueFrom } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserServiceRmqAdapter {
  private readonly logger = new Logger(UserServiceRmqAdapter.name);

  constructor(@Inject(USER_SERVICE) private readonly userClient: ClientProxy) {}

  async createUser(data: any): Promise<any> {
    try {
      this.logger.debug(`📤 Sending create_user message via RMQ: ${JSON.stringify(data, null, 2)}`);

      const response = await lastValueFrom(
        this.userClient.send({ cmd: 'create_user' }, data)
      );

      this.logger.debug(`✅ Received response from UserService: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      this.logger.error('❌ Failed to create user via RMQ adapter', error);
      throw new RpcException({
        status: 'error',
        message: 'Failed to create user via RMQ adapter',
      });
    }
  }
}
