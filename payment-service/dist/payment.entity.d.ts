import { Document } from 'mongoose';
export declare class Payment extends Document {
    amount: number;
    payment_date: Date;
    payment_gateway: string;
    payment_status: string;
    transaction_id: string;
    order_id: number;
    user_id: number;
}
export declare const PaymentSchema: import("mongoose").Schema<Payment, import("mongoose").Model<Payment, any, any, any, Document<unknown, any, Payment, any, {}> & Payment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payment, Document<unknown, {}, import("mongoose").FlatRecord<Payment>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Payment> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
