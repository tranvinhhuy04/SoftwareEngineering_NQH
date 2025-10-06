import { Types } from "mongoose";
import { CustomerProfileEntity } from "../../domain/entities/customerProfile.entity";
import { UserEntity } from "../../domain/entities/user.entity";

export class CustomerMapper {
  static toEntity(customerDoc: any): CustomerProfileEntity | null {
    if (!customerDoc) return null;

    return new CustomerProfileEntity(
      customerDoc._id,
      customerDoc.ID,
      customerDoc.user,
      customerDoc.defaultAddress ?? "",
      customerDoc.preferredPaymentMethod ?? "",
      customerDoc.savedPaymentMethods ?? [],
      customerDoc.favoriteItems ?? []
    );
  }

  static toCustomerPersistence(customer: any, user: UserEntity): any {
    return {
      _id: customer.get_Id(),
      ID: customer.ID,
      user: user.get_Id(),
      defaultAddress: customer.defaultAddress ?? "",
      preferredPaymentMethod: customer.preferredPaymentMethod ?? "",
      savedPaymentMethods: customer.savedPaymentMethods ?? [],
      favoriteItems: customer.favoriteItems ?? [],
    };
  }

  static mapperCustomerDtoToEntity(dto: any, user: UserEntity, customerProfileID: string): CustomerProfileEntity {
    return new CustomerProfileEntity(
      customerProfileID,
      user.get_Id() ?? new Types.ObjectId(),
      dto.defaultAddress ?? "",
      dto.preferredPaymentMethod ?? "",
      dto.savedPaymentMethods ?? [],
      dto.favoriteItems ?? [],
      undefined,
    );
  }
}
