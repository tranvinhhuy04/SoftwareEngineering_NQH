import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './payment.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    private readonly http: HttpService, 
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  async createPayment(data: any) {
    const orderApiUrl = `http://localhost:4002/orders/${data.order_id}`; 
      try {
        const userId = data.user_id;
        Logger.debug(`Verifying user with ID: ${userId}`);
        const userExists = await firstValueFrom(
          this.userClient.send({ cmd: 'get_user_by_id' },userId),
        );
      } catch (error) {
        throw new Error('Failed to verify user');
      }
    try {
        Logger.debug(`Verifying user with ID: ${orderApiUrl}`);

        const response = await firstValueFrom(this.http.get(orderApiUrl));
        const order = response.data;
        Logger.debug(`Order details: ${JSON.stringify(order)}`);

        const newPayment = new this.paymentModel(data);
        Logger.debug(`Creating payment with data: ${JSON.stringify(data)}`);
        return newPayment.save();
      
    } catch (error) {
      throw new Error('Failed to fetch order details');
    }
  }

  async getAll() {
    return this.paymentModel.find().exec(); // ✅ Trả về toàn bộ payment
  }

  async updateStatus(id: string, status: string) {
    return this.paymentModel.findByIdAndUpdate(
      id,
      { payment_status: status },
      { new: true },
    );
  }
}
