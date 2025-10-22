import { CustomerProfileEntity } from "src/users/domain/entities/customerProfile.entity";
import { UserEntity } from "src/users/domain/entities/user.entity";

export class CustomerMapper {
  // 🧩 1️⃣ Document / Row → Entity
  static toEntity(customer: any): CustomerProfileEntity | null {
    if (!customer) return null;

    return new CustomerProfileEntity(
      customer.ID || customer.id,
      customer.user || customer.userId,
      customer.defaultAddress ?? "",
      customer.preferredPaymentMethod ?? "",
      customer.savedPaymentMethods ?? [],
      customer.favoriteItems ?? [],
      customer._id || customer.id || undefined
    );
  }

  // 🧩 2️⃣ Entity → Object để lưu DB
  static toCustomerPersistence(
    customer: CustomerProfileEntity,
    user: UserEntity
  ): any {
    const dbType = process.env.DB_TYPE || "mongo";

    if (dbType === "mongo") {
      return {
        ID: customer.ID,
        user: user.get_Id(),
        defaultAddress: customer.defaultAddress ?? "",
        preferredPaymentMethod: customer.preferredPaymentMethod ?? "",
        savedPaymentMethods: customer.savedPaymentMethods ?? [],
        favoriteItems: customer.favoriteItems ?? [],
      };
    }

    // MySQL
    return {
      id: customer.ID,
      userId: user.get_Id(),
      defaultAddress: customer.defaultAddress ?? "",
      preferredPaymentMethod: customer.preferredPaymentMethod ?? "",
      savedPaymentMethods: JSON.stringify(customer.savedPaymentMethods ?? []),
      favoriteItems: JSON.stringify(customer.favoriteItems ?? []),
    };
  }

  // 🧩 3️⃣ DTO → Entity
  static mapperCustomerDtoToEntity(
    dto: any,
    user: UserEntity,
    customerProfileID: string
  ): CustomerProfileEntity {
    return new CustomerProfileEntity(
      customerProfileID,
      user.get_Id() as string,
      dto.defaultAddress ?? "",
      dto.preferredPaymentMethod ?? "",
      dto.savedPaymentMethods ?? [],
      dto.favoriteItems ?? [],
      undefined
    );
  }
}
