import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Order } from './order.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  async createOrder(data: { productId: string; quantity: number; userId: number }) {
    // Lấy giá từ product-service qua RabbitMQ
    const product = await this.productClient
      .send({ cmd: 'get_product' }, { id: data.productId })
      .toPromise();

    const price = product?.price || 0;

    const order = this.orderRepo.create({
      product_id: data.productId,
      user_id: data.userId,
      quantity: data.quantity,
      price_per_unit: price,
      subtotal: price * data.quantity,
      order_status: 'Pending',
      order_date: new Date(),
    });

    return this.orderRepo.save(order);
  }

  getAllOrders() {
    return this.orderRepo.find();
  }
}
