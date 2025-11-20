import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<Category>) {}

  findAll() {
    return this.categoryModel.find().exec();
  }

  findOne(id: string) {
    return this.categoryModel.findById(id).exec();
  }

  async create(data: Partial<Category>) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Name is required');
    }
    const name = data.name;
    if (typeof name !== 'string') {
      throw new Error('Name must be a string');
    }
    if (await this.categoryModel.findOne({ name: name }).exec()) {
      throw new Error('Category already exists');
    }
    
    const newCategory = new this.categoryModel(data);
    return newCategory.save();
  }

  update(id: string, data: Partial<Category>) {
    return this.categoryModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  delete(id: string) {
    return this.categoryModel.findByIdAndDelete(id).exec();
  }
}
