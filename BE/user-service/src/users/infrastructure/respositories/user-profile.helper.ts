import { UserType } from "src/users/domain/enum/user-type.enum";
import { DeliveryMapper } from "../mappers/delivery.mapper";
import { CustomerMapper } from "../mappers/customer.mapper";
import { StaffMapper } from "../mappers/staff.mapper";

export class UserProfileHelper {
  static async attachProfile(userDoc: any, models: any, mappers: any, logger: any) {
    const { deliveryModel, customerModel, staffModel } = models;
    const { DeliveryMapper, CustomerMapper, StaffMapper } = mappers;
    const user = mappers.UserMapper.toEntity(userDoc);

    logger.debug(`Attaching profile for _id=${user.get_Id()}, userType=${user.userType}`);

    switch (user.userType) {
      case UserType.DELIVERY:
        const deliveryDoc = await deliveryModel.findOne({ user: userDoc._id }).exec();
        if (deliveryDoc) user.assignDeliveryProfile(DeliveryMapper.toEntity(deliveryDoc));
        break;
      case UserType.CUSTOMER:
        const customerDoc = await customerModel.findOne({ user: userDoc._id }).exec();
        if (customerDoc) user.assignCustomerProfile(CustomerMapper.toEntity(customerDoc));
        break;
      case UserType.STAFF:
        const staffDoc = await staffModel.findOne({ user: userDoc._id }).exec();
        if (staffDoc) user.assignStaffProfile(StaffMapper.toEntity(staffDoc));
        break;
    }
    return user;
  }

  static async findUserIdsByProfile(userType: UserType, filters: any, models: any, logger: any) {
    const modelMap = {
      [UserType.DELIVERY]: models.deliveryModel,
      [UserType.CUSTOMER]: models.customerModel,
      [UserType.STAFF]: models.staffModel,
    };

    const model = modelMap[userType];
    if (!model) return [];
    const docs = await model.find(filters, { user: 1 }).exec();
    const userIds = docs.map((doc) => doc.user.toString());
    logger.debug(`Found ${userIds.length} userIds from ${userType} profile`);
    return userIds;
  }
}
