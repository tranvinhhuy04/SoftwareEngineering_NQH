import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { USER_SERVICE } from 'src/auth/contact/services/services';

@Injectable()
export class UserServiceRmqAdapter {
  private readonly logger = new Logger(UserServiceRmqAdapter.name);

  constructor(@Inject(USER_SERVICE) private readonly userClient: ClientProxy) {}

  async createUser(data: any): Promise<any> {
    try {
      // 🔹 Xóa mọi _id thừa trong payload để tránh lỗi "immutable _id"
      const cleanData = JSON.parse(
        JSON.stringify(data, (key, value) => (key === '_id' ? undefined : value))
      );

      this.logger.debug(
        `📤 Sending create_user message via RMQ:\n${JSON.stringify(cleanData, null, 2)}`
      );

      const response = await lastValueFrom(
        this.userClient.send({ cmd: 'create_user' }, cleanData)
      );

      this.logger.debug(
        `✅ Received response from UserService:\n${JSON.stringify(response, null, 2)}`
      );

      // Đảm bảo UserService trả về _id Mongo thật
      if (!response?._id) {
        throw new RpcException('UserService did not return _id');
      }

      return response;
    } catch (error) {
      this.logger.error('❌ Failed to create user via RMQ adapter');
      this.logger.error(error?.message || error);
      this.logger.debug(`Stack: ${error?.stack}`);

      throw new RpcException({
        status: 'error',
        message: 'Failed to create user via RMQ adapter',
      });
    }
  }
}
