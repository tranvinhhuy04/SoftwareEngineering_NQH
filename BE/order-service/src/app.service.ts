import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Order } from './order.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    // @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
    private readonly http: HttpService, 
  ) {}

  async createOrder(data: { productId: string; quantity: number; userId: number }) {
    // ✅ Gọi product-service qua HTTP REST
    const productApiUrl = `http://localhost:4003/products/${data.productId}`; 
    const response = await firstValueFrom(this.http.get(productApiUrl));
    const product = response.data;

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
