export class UpdateCustomerDto {
    readonly defaultAddress?: string;
    readonly preferredPaymentMethod?: string;
    readonly savedPaymentMethods?: string[];
    readonly favoriteItems?: string[];
}