import { DeliveryProfileEntity } from "src/users/domain/entities/deliveryProfile.entity";
import { UserEntity } from "src/users/domain/entities/user.entity";
import { Available } from "src/users/domain/enum/delivery-available.enum";
import { Vehicle } from "src/users/domain/enum/delivery-vehicle.enum";

export class DeliveryMapper {
  // 🧩 1️⃣ Document / Row → Entity
    static toEntity(input: any): DeliveryProfileEntity {
    if (!input) throw new Error("DeliveryMapper.toEntity() received null input");
    return new DeliveryProfileEntity(
        input.ID || input.id,
        input.user || input.userId,
        input.available,
        input.vehicle_info,
        input._id || input.id || undefined
    );
    }

  // 🧩 2️⃣ Entity → Object để lưu DB
  static toDeliveryPersistence(
    delivery: DeliveryProfileEntity,
    user: UserEntity
  ): any {
    const dbType = process.env.DB_TYPE || "mongo";

    if (dbType === "mongo") {
      return {
        ID: delivery.ID,
        user: user.get_Id(),
        available: delivery.available ?? Available.ASSIGN,
        vehicle_info: delivery.vehicle_info ?? Vehicle.MOTORBIKE,
      };
    }

    // MySQL
    return {
      id: delivery.ID,
      userId: user.ID,
      available: delivery.available ?? Available.ASSIGN,
      vehicle_info: delivery.vehicle_info ?? Vehicle.MOTORBIKE,
    };
  }

  // 🧩 3️⃣ DTO → Entity
  static mapperDeliveryDtoToEntity(
    dto: any,
    user: UserEntity,
    deliveryProfileID: string
  ): DeliveryProfileEntity {
    return new DeliveryProfileEntity(
      deliveryProfileID,
      user.ID as string,
      dto.available ?? Available.ASSIGN,
      dto.vehicle_info ?? Vehicle.MOTORBIKE,
      undefined
    );
  }
}
