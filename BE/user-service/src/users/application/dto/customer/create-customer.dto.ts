import { CreateUserDto } from "../user/create-user.dto";

export class CreateCustomerDto {
    readonly user?: CreateUserDto; 
    readonly defaultAddress?: string;
    readonly preferredPaymentMethod?: string;
    readonly savedPaymentMethods: string[] = [];
    readonly favoriteItems: string[] = [];
}