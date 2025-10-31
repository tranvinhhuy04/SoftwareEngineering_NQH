import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './payment.entity';

@Injectable()
export class AppService {
  constructor(@InjectModel(Payment.name) private readonly paymentModel: Model<Payment>) {}

  async createPayment(data: any) {
    const payment = new this.paymentModel(data);
    const result = await payment.save();
    return result; // ✅ Trả lại document vừa được lưu
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
