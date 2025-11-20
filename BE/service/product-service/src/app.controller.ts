import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ProductService } from './app.service';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { CategoryService } from './cartegory.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService
  ) {}

  @Get()
  getAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Post()
  createProduct(@Body() data: Product) {
    return this.productService.create(data);
  }

  @Post('categories')
  createCategory(@Body() data: Category) {
    return this.categoryService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Product>) {
    return this.productService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
