import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.entity';
import { Category } from './category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>
  ) {}

  findAll() {
    const data = this.productModel.find().exec();
  }

  findOne(id: string) {
    return this.productModel.findById(id).exec();
  }

  async create(data: Partial<Product>) {
    Logger.debug('data', data);
    const category = data.category;
    try {
      const validCategory = await this.categoryModel.findOne({ name: category }).exec();
      if (!validCategory) {
        throw new Error('Invalid category');
      }
      const newProduct = new this.productModel(data);
      return newProduct.save();
      } catch (error) {
        Logger.error(error);
        throw error; // ✅ Rethrow lỗi gốc, không bị mất message
      }
  }

  update(id: string, data: Partial<Product>) {
    return this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  delete(id: string) {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
