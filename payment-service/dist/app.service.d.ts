import { Model } from 'mongoose';
import { Payment } from './payment.entity';
export declare class AppService {
    private readonly paymentModel;
    constructor(paymentModel: Model<Payment>);
    createPayment(data: any): Promise<import("mongoose").Document<unknown, {}, Payment, {}, {}> & Payment & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getAll(): Promise<(import("mongoose").Document<unknown, {}, Payment, {}, {}> & Payment & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    updateStatus(id: string, status: string): Promise<(import("mongoose").Document<unknown, {}, Payment, {}, {}> & Payment & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
}
