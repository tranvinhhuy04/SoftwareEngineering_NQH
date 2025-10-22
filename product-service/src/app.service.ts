import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.entity';
import { MessagePattern } from '@nestjs/microservices';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  // ⚡️ Handler lắng nghe yêu cầu lấy sản phẩm từ order-service
  @MessagePattern({ cmd: 'get_product' })
  async getProduct(data: { id: string }) {
    // bạn có thể dùng findOne({ productId: data.id }) nếu productId là trường riêng
    return this.productModel.findById(data.id).exec();
  }

  // ⚡️ (tuỳ chọn) cho phép lấy tất cả product qua RabbitMQ
  @MessagePattern({ cmd: 'get_products' })
  async getAllProducts() {
    return this.productModel.find().exec();
  }

  // Các hàm REST cũ vẫn dùng được
  findAll() {
    return this.productModel.find().exec();
  }

  findOne(id: string) {
    return this.productModel.findById(id).exec();
  }

  create(data: Partial<Product>) {
    const newProduct = new this.productModel(data);
    return newProduct.save();
  }

  update(id: string, data: Partial<Product>) {
    return this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  delete(id: string) {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
