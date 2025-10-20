import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProductService } from './app.service';
import { Product } from './product.entity';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'get_products' })
  getAll(): Product[] {
    return this.productService.findAll();
  }

  @MessagePattern({ cmd: 'get_product' })
  getOne(data: { id: number }): Product | undefined {
    return this.productService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'create_product' })
  create(product: Product): Product {
    return this.productService.create(product);
  }

  @MessagePattern({ cmd: 'update_product' })
  update(data: { id: number; [key: string]: any }): Product | undefined {
    return this.productService.update(data.id, data);
  }

  @MessagePattern({ cmd: 'delete_product' })
  delete(data: { id: number }): boolean {
    return this.productService.delete(data.id);
  }
}
