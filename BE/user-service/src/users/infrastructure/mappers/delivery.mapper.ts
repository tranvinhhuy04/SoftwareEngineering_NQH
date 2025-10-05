import { Types } from "mongoose";
import { DeliveryProfileEntity } from "src/users/domain/entities/deliveryProfile.entity";
import { UserEntity } from "src/users/domain/entities/user.entity";
import { Available } from "src/users/domain/enum/delivery-available.enum";
import { Vehicle } from "src/users/domain/enum/delivery-vehicle.enum";

export class DeliveryMapper {
        static toEntity(deliveryDoc: any): DeliveryProfileEntity | null {
            if (!deliveryDoc) return null;

            return new DeliveryProfileEntity(
                deliveryDoc._id,
                deliveryDoc.ID,
                deliveryDoc.user,
                deliveryDoc.available,
                deliveryDoc.vehicle_info
            );
        }

    static toDeliveryPersistence(detail: any, user: UserEntity): any {
        return {
            _id: new Types.ObjectId(),
            ID: detail.ID,
            user: user.get_Id(),
            available: detail.available,
            vehicle_info: detail.vehicle_info,
        };
    }

    static mapperDeliveryDtoToEntity(dto: any, user: UserEntity, deliveryProfileID: string): DeliveryProfileEntity {
        return new DeliveryProfileEntity(
            new Types.ObjectId(), // hoặc nhận từ Use Case
            deliveryProfileID,
            user.get_Id(),
            dto.available ?? Available.ASSIGN,
            dto.vehicle_info ?? Vehicle.MOTORBIKE
        );
    }

}