import { OnModuleInit } from '@nestjs/common';
export declare class AppService implements OnModuleInit {
    private client;
    onModuleInit(): void;
    pingOrder(): Promise<string>;
}
