import { UserType } from 'src/users/domain/enum/user-type.enum';

export class UserProfileHelper {
  static async attachProfile(
    userDoc: any,
    models: any,
    mappers: any,
    logger: any,
  ) {
    const { deliveryModel, customerModel, staffModel } = models;
    const { DeliveryMapper, CustomerMapper, StaffMapper } = mappers;
    const user = mappers.UserMapper.toEntity(userDoc);

    logger.debug(
      `Attaching profile for _id=${user.get_Id()}, userType=${user.userType}`,
    );

    switch (user.userType) {
      case UserType.DELIVERY:
        const deliveryDoc = await deliveryModel
          .findOne({ user: userDoc._id })
          .exec();
        if (deliveryDoc)
          user.assignDeliveryProfile(DeliveryMapper.toEntity(deliveryDoc));
        break;
      case UserType.CUSTOMER:
        const customerDoc = await customerModel
          .findOne({ user: userDoc._id })
          .exec();
        if (customerDoc)
          user.assignCustomerProfile(CustomerMapper.toEntity(customerDoc));
        break;
      case UserType.STAFF:
        const staffDoc = await staffModel.findOne({ user: userDoc._id }).exec();
        if (staffDoc) user.assignStaffProfile(StaffMapper.toEntity(staffDoc));
        break;
    }
    return user;
  }

  static async findUserIdsByProfile(
    userType: UserType,
    filters: any,
    models: any,
    logger: any,
  ): Promise<string[]> {
    const modelMap = {
      [UserType.DELIVERY]: models.deliveryModel,
      [UserType.CUSTOMER]: models.customerModel,
      [UserType.STAFF]: models.staffModel,
    };

    const model = modelMap[userType];
    if (!model) {
      logger.warn(`⚠️ No profile model available for userType=${userType}`);
      return [];
    }

    // Tách filter đúng cho từng profile
    const profileFilters = this.extractProfileFilters(filters);

    logger.debug(
      `Running profile query for userType=${userType} → ${JSON.stringify(profileFilters)}`,
    );

    //  Query profile collection => lấy danh sách userId
    const docs = await model.find(profileFilters, { user: 1 }).exec();

    const userIds = docs.map((doc) => doc.user.toString());

    logger.debug(
      `Found ${userIds.length} matching profiles for userType=${userType}`,
    );

    return userIds;
  }

  /** Tách filter dành riêng cho profile collection (flatten nested) */
  static extractProfileFilters(filters: any): Record<string, any> {
    const profileFilters: Record<string, any> = {};

    // DELIVERY PROFILE
    if (
      filters.deliveryProfile &&
      typeof filters.deliveryProfile === 'object'
    ) {
      Object.assign(profileFilters, filters.deliveryProfile);
    }

    // CUSTOMER PROFILE
    if (
      filters.customerProfile &&
      typeof filters.customerProfile === 'object'
    ) {
      Object.assign(profileFilters, filters.customerProfile);
    }

    // STAFF PROFILE
    if (filters.staffProfile && typeof filters.staffProfile === 'object') {
      Object.assign(profileFilters, filters.staffProfile);
    }

    // Remove values like null / undefined / "" to avoid wrong filtering
    return Object.fromEntries(
      Object.entries(profileFilters).filter(
        ([_, v]) => v !== undefined && v !== null && v !== '',
      ),
    );
  }
}
