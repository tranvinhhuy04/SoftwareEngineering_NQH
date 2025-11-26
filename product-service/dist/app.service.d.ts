import { Model } from 'mongoose';
import { Product } from './product.entity';
export declare class ProductService {
    private productModel;
    constructor(productModel: Model<Product>);
    findAll(): Promise<(import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<(import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<Product>): Promise<import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & Required<{
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
