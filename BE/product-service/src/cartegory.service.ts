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

  create(data: Partial<Category>) {
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
