import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    createPayment(data: any): Promise<import("mongoose").Document<unknown, {}, import("./payment.entity").Payment, {}, {}> & import("./payment.entity").Payment & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getAllPayments(): Promise<(import("mongoose").Document<unknown, {}, import("./payment.entity").Payment, {}, {}> & import("./payment.entity").Payment & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    updateStatus(id: string, status: string): Promise<(import("mongoose").Document<unknown, {}, import("./payment.entity").Payment, {}, {}> & import("./payment.entity").Payment & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
}
