import { ProductService } from './app.service';
import { Product } from './product.entity';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    getAll(): Promise<(import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getOne(id: string): Promise<(import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    create(data: Product): Promise<import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, data: Partial<Product>): Promise<(import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    delete(id: string): Promise<(import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
}
