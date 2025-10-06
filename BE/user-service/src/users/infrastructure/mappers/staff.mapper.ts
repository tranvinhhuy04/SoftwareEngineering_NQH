import { Types } from "mongoose";
import { StaffProfileEntity } from "src/users/domain/entities/staffProfile.entity";
import { UserEntity } from "src/users/domain/entities/user.entity";

export class StaffMapper {
    static toEntity(staffDoc: any): StaffProfileEntity | null {
        if (!staffDoc) return null;

        return new StaffProfileEntity(
            staffDoc.ID,
            staffDoc.user,
            staffDoc.shift,
            staffDoc.isActive,
            staffDoc.handledOrders,
            staffDoc._id,

        );
    }

    static toStaffPersistence(staff: any, user: UserEntity): any {
        return {
        _id: new Types.ObjectId(),
        ID: staff.ID,
        user: user.get_Id(),
        shift: staff.shift,
        isActive: staff.isActive,
        handledOrders: staff.handledOrders,
        };
    }

    static mapperStaffDtoToEntity(dto: any, user: UserEntity, staffProfileID: string): StaffProfileEntity {
        return new StaffProfileEntity(
        staffProfileID,
        user.get_Id() ?? new Types.ObjectId(),
        dto.shift || '',
        dto.isActive || true,
        dto.handledOrders || 0,
        undefined,
        );
    }
}