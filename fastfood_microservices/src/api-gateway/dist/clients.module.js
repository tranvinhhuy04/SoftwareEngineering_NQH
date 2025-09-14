"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsProviderModule = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
let ClientsProviderModule = class ClientsProviderModule {
};
exports.ClientsProviderModule = ClientsProviderModule;
exports.ClientsProviderModule = ClientsProviderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            microservices_1.ClientsModule.register([
                {
                    name: 'ORDER_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: 'order-service', port: 4001 },
                },
                {
                    name: 'PAYMENT_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: 'payment-service', port: 4002 },
                },
                {
                    name: 'PRODUCT_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: 'product-service', port: 4003 },
                },
                {
                    name: 'USER_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: 'user-service', port: 4004 },
                },
            ]),
        ],
        exports: [microservices_1.ClientsModule],
    })
], ClientsProviderModule);
//# sourceMappingURL=clients.module.js.map