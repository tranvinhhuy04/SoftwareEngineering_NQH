import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserEntity } from "src/users/domain/entities/user.entity";
import { IUserRepository } from "src/users/domain/respositories/user.repository";
import { UserMapper } from "../mappers/user.mapper";
import { User, UserDocument } from "../database/user.schema";
import { DeliveryProfile, DeliveryProfileDocument } from "../database/deliveryProfile.schema";
import { UserType } from "src/users/domain/enum/user-type.enum";
import { CustomerProfile, CustomerProfileDocument } from "../database/customerProfile.schema";
import { StaffProfile, StaffProfileDocument } from "../database/staffProfile.schema";
import { DeliveryMapper } from "../mappers/delivery.mapper";
import { CustomerMapper } from "../mappers/customer.mapper";
import { StaffMapper } from "../mappers/staff.mapper"; // ⚠️ bạn quên import file này

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  private readonly logger = new Logger(UserRepositoryImpl.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(DeliveryProfile.name)
    private readonly deliveryModel: Model<DeliveryProfileDocument>,

    @InjectModel(CustomerProfile.name)
    private readonly customerProfileModel: Model<CustomerProfileDocument>,

    @InjectModel(StaffProfile.name)
    private readonly staffProfileModel: Model<StaffProfileDocument>
  ) {}

  // SAVE USER + PROFILE   //
  async save(user: UserEntity): Promise<UserEntity> {
    try {
      const userObj = UserMapper.toUserPersistence(user);

      const savedUser = await this.userModel.findOneAndUpdate(
      { ID: user.ID },
        userObj,
        { upsert: true, new: true } // ✅ Trả về document thật sau khi lưu
      );
      (user as any)._id = savedUser._id; // ✅ Gán _id thật từ Mongo
      this.logger.debug(`User saved with _id=${savedUser._id}`);

      // Save profile tùy theo loại user
      if (user.userType === UserType.DELIVERY && user.getDeliveryProfile()) {
        try {
          const deliveryObj = DeliveryMapper.toDeliveryPersistence(
            user.getDeliveryProfile(),
            user
          );
          const deliveryResult = await this.deliveryModel.updateOne(
            { user: user.get_Id() },
            deliveryObj,
            { upsert: true }
          );
          this.logger.debug(
            `DeliveryProfile upsert result: ${JSON.stringify(deliveryResult)}`
          );
        } catch (deliveryErr) {
          this.logger.error(
            `Error saving delivery Profile for user ${user.ID}: ${deliveryErr.message}`
          );
          throw new Error(
            `Error saving delivery Profile: ${deliveryErr.message}`
          );
        }
      }

      if (user.userType === UserType.CUSTOMER && user.getCustomerProfile()) {
        try {
          const customerObj = CustomerMapper.toCustomerPersistence(
            user.getCustomerProfile(),
            user
          );
          await this.customerProfileModel.updateOne(
            { user: user.get_Id() },
            customerObj,
            { upsert: true }
          );
        } catch (error) {
          this.logger.error(
            `Error saving customer Profile for user ${user.ID}: ${error.message}`
          );
          throw new Error(`Error saving customer Profile: ${error.message}`);
        }
      }

      if (user.userType === UserType.STAFF && user.getStaffProfile()) {
        try {
          const staffObj = StaffMapper.toStaffPersistence(
            user.getStaffProfile(),
            user
          );
          await this.staffProfileModel.updateOne(
            { user: user.get_Id() },
            staffObj,
            { upsert: true }
          );
        } catch (error) {
          this.logger.error(
            `Error saving staff Profile for user ${user.ID}: ${error.message}`
          );
          throw new Error(`Error saving staff Profile: ${error.message}`);
        }
      }

      return user;
    } catch (error) {
      this.logger.error(`Error saving user: ${error.message}`);
      throw new Error(`Error saving user: ${error.message}`);
    }
  }

  // FIND ALL USERS        //
    async findAll(): Promise<UserEntity[]> {
      try {
        const allUser: UserEntity[] = [];
        const users = await this.userModel.find().exec();
        this.logger.debug(`findAll returned: ${users.length}`);

        if (!users || users.length === 0) return [];
        for (const userDoc of users) {
          this.logger.debug(`Processing user: ${JSON.stringify(userDoc)}`);
          allUser.push(await this.attachProfile(userDoc));
        }

        return allUser;
      } catch (error) {
        this.logger.error(`Error finding all users: ${error.message}`);
        throw new Error(`Error finding all users: ${error.message}`);
      }
    }


  // FIND ONE / BY FILTER  //
  private async findOneByFilter(
    filter: Partial<{ ID: string; email: string; userType: UserType }>
  ): Promise<UserEntity | null> {
    try {
      const userDoc = await this.userModel.findOne(filter).exec();
      this.logger.debug(`findOneByFilter with filter=${JSON.stringify(filter)} returned: ${JSON.stringify(userDoc)}`);
      if (!userDoc) return null;
      return this.attachProfile(userDoc);
    } catch (error) {
      this.logger.error(
        `Error finding user by filter ${JSON.stringify(filter)}: ${error.message}`
      );
      throw new Error(`Error finding user by filter: ${error.message}`);
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      return await this.findOneByFilter({ ID: id });
    } catch (error) {
      this.logger.error(`Error finding user by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      return await this.findOneByFilter({ email:email });
    } catch (error) {
      this.logger.error(`Error finding user by email ${email}: ${error.message}`);
      throw error;
    }
  }

  // DELETE USER           //
  async remove(id: string): Promise<void> {
    try {
      const user = await this.userModel.findOne({ ID: id }).exec();
      if (!user) {
        this.logger.warn(`User with ID ${id} not found for deletion`);
        return;
      }
      
      switch (user.userType) {
        case UserType.DELIVERY:
          try {
            await this.deliveryModel.deleteOne({ user: user._id }).exec();
          } catch (error) {
            this.logger.error(`Error deleting delivery profile for user ID ${id}: ${error.message}`);
          }
          this.logger.debug(`Deleted delivery profile for user ID ${id}`);
          break;
        case UserType.CUSTOMER:
          try {
            await this.customerProfileModel.deleteOne({ user: user._id }).exec();
          } catch (error) {
            this.logger.error(`Error deleting customer profile for user ID ${id}: ${error.message}`);
          }
          this.logger.debug(`Deleted customer profile for user ID ${id}`);
          break;
        case UserType.STAFF:
          try {
            await this.staffProfileModel.deleteOne({ user: user._id }).exec();
          } catch (error) {
            this.logger.error(`Error deleting staff profile for user ID ${id}: ${error.message}`);
          }
          this.logger.debug(`Deleted staff profile for user ID ${id}`);
          break;
      }

      await this.userModel.deleteOne({ _id: user._id }).exec();
      this.logger.debug(`Deleted user with ID ${id}`);

    } catch (error) {
      this.logger.error(`Error deleting user by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  // FIND BY FILTERS      //
  async findByFilters(filters: any): Promise<UserEntity[]> {
    try {
      const { name, email, userType, active, page = 1, limit = 10, ...profileFilters } = filters;
      const query: Record<string, any> = {};

      if (name) query.name = { $regex: name, $options: 'i' };
      if (email) query.email = { $regex: email, $options: 'i' };
      if (userType) query.userType = userType;
      if (active) query.active = active;

      // 🧩 Nếu có filter nằm trong profile
      if (userType && Object.keys(profileFilters).length > 0) {
        const userIds = await this.findUserIdsByProfile(userType, profileFilters);
        if (userIds.length === 0) return [];
        query._id = { $in: userIds };
      }

      const pageNum = Number.isInteger(+page) && +page > 0 ? +page : 1;
      const limitNum = Number.isInteger(+limit) && +limit > 0 ? +limit : 10;
      const skip = (pageNum - 1) * limitNum;
      this.logger.debug(`Pagination → page=${pageNum}, limit=${limitNum}, skip=${skip}`);


      const [userDocs, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(limitNum).exec(),
      this.userModel.countDocuments(query).exec(),
    ]);


      if (!userDocs.length) return [];

      const users = await Promise.all(userDocs.map((doc) => this.attachProfile(doc)));
      this.logger.debug(`Found ${users.length}/${total} users`);
      return users;
    } catch (error) {
      this.logger.error(`Error finding users by filters: ${error.message}`);
      throw new Error(`Error finding users by filters: ${error.message}`);
    }
  }


  // HELPERS              //
    private async attachProfile(userDoc: UserDocument): Promise<UserEntity> {
    const user = UserMapper.toEntity(userDoc);
    this.logger.debug(`Attaching profile for _id=${user.get_Id()}, userType=${user.userType}`);

    switch (user.userType) {
      case UserType.DELIVERY: {
        const deliveryDoc = await this.deliveryModel.findOne({ user: userDoc._id }).exec();
        this.logger.debug(`Found delivery profile for _id=${user.get_Id()}: ${JSON.stringify(deliveryDoc)}`);
        const deliveryProfileEntity = DeliveryMapper.toEntity(deliveryDoc);
        this.logger.debug(`Attached delivery profile for userType=${user.userType}: ${JSON.stringify(deliveryProfileEntity)}`);
        if (deliveryProfileEntity) user.assignDeliveryProfile(deliveryProfileEntity);
        break;
      }
      case UserType.CUSTOMER: {
        const customerDoc = await this.customerProfileModel.findOne({ user: userDoc._id }).exec();
        this.logger.debug(`Found customer profile for userType=${user.userType}: ${JSON.stringify(customerDoc)}`);
        const customerProfileEntity = CustomerMapper.toEntity(customerDoc);
        this.logger.debug(`Attached customer profile for userType=${user.userType}: ${JSON.stringify(customerProfileEntity)}`);
        if (customerProfileEntity) user.assignCustomerProfile(customerProfileEntity);
        break;
      }
      case UserType.STAFF: {
        const staffDoc = await this.staffProfileModel.findOne({ user: userDoc._id }).exec();
        this.logger.debug(`Found staff profile for userType=${user.userType}: ${JSON.stringify(staffDoc)}`);
        const staffProfileEntity = StaffMapper.toEntity(staffDoc);
        this.logger.debug(`Attached staff profile for userType=${user.userType}: ${JSON.stringify(staffProfileEntity)}`);
        if (staffProfileEntity) user.assignStaffProfile(staffProfileEntity);
        break;
      }
    }

    return user;
  }

  private async findUserIdsByProfile(userType: UserType, profileFilters: any): Promise<string[]> {
    const modelMap = {
      [UserType.DELIVERY]: this.deliveryModel,
      [UserType.CUSTOMER]: this.customerProfileModel,
      [UserType.STAFF]: this.staffProfileModel,
    };

    const profileModel = modelMap[userType];
    if (!profileModel) return [];

    // Lọc bằng các field trong profile
    const profileDocs = await profileModel.find(profileFilters, { user: 1 }).exec();
    const userIds = profileDocs.map((doc) => doc.user.toString());
    this.logger.debug(
      `Found ${userIds.length} userIds from ${userType} profiles with filters=${JSON.stringify(profileFilters)}`
    );
    return userIds;
  }

}
