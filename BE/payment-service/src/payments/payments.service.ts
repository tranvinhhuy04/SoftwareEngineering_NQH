import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(@InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      const createdPayment = new this.paymentModel(createPaymentDto);
      return await createdPayment.save();
    } catch (error) {
      throw new InternalServerErrorException('Error creating payment');
    }
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find().exec();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.paymentModel.findByIdAndUpdate(id, updatePaymentDto, { new: true }).exec();
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async remove(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findByIdAndDelete(id).exec();
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }
}
