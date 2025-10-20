import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IUserRepository } from "src/users/domain/respositories/user.repository";
import { UserEntity } from "src/users/domain/entities/user.entity";
import { UserType } from "src/users/domain/enum/user-type.enum";
import { User, UserDocument } from "../database/user.schema";
import { DeliveryProfile, DeliveryProfileDocument } from "../database/deliveryProfile.schema";
import { CustomerProfile, CustomerProfileDocument } from "../database/customerProfile.schema";
import { StaffProfile, StaffProfileDocument } from "../database/staffProfile.schema";
import { UserMapper } from "../mappers/user.mapper";
import { DeliveryMapper } from "../mappers/delivery.mapper";
import { CustomerMapper } from "../mappers/customer.mapper";
import { StaffMapper } from "../mappers/staff.mapper";
import { UserQueryHelper } from "./user-query.helper";
import { UserProfileHelper } from "./user-profile.helper";
import { UpdateUserDto } from "src/users/application/dto/user/update-user.dto";

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  private readonly logger = new Logger(UserRepositoryImpl.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(DeliveryProfile.name) private readonly deliveryModel: Model<DeliveryProfileDocument>,
    @InjectModel(CustomerProfile.name) private readonly customerModel: Model<CustomerProfileDocument>,
    @InjectModel(StaffProfile.name) private readonly staffModel: Model<StaffProfileDocument>,
  ) {}

  // ✅ UPDATE USER + PROFILE
  async update(id: string, user: UserEntity): Promise<UserEntity> {
    try {
      const existingUser = await this.userModel.findOne({ ID: id }).exec();
      if (!existingUser) throw new Error(`User with ID=${id} not found`);

      const userObj = UserMapper.toUserPersistence(user);
      const updatedUserDoc = await this.userModel.findOneAndUpdate(
        { ID: id },
        userObj,
        { new: true }
      ).exec();

      if (!updatedUserDoc) throw new Error(`Failed to update user with ID=${id}`);

      // Cập nhật profile theo userType
      switch (user.userType) {
        case UserType.DELIVERY:
          if (user.getDeliveryProfile()) {
            const deliveryObj = DeliveryMapper.toDeliveryPersistence(user.getDeliveryProfile(), user);
            await this.deliveryModel.updateOne({ user: updatedUserDoc._id }, deliveryObj, { upsert: true });
          }
          break;
        case UserType.CUSTOMER:
          if (user.getCustomerProfile()) {
            const customerObj = CustomerMapper.toCustomerPersistence(user.getCustomerProfile(), user);
            await this.customerModel.updateOne({ user: updatedUserDoc._id }, customerObj, { upsert: true });
          }
          break;
        case UserType.STAFF:
          if (user.getStaffProfile()) {
            const staffObj = StaffMapper.toStaffPersistence(user.getStaffProfile(), user);
            await this.staffModel.updateOne({ user: updatedUserDoc._id }, staffObj, { upsert: true });
          }
          break;
      }

      const updatedEntity = await UserProfileHelper.attachProfile(
        updatedUserDoc,
        {
          deliveryModel: this.deliveryModel,
          customerModel: this.customerModel,
          staffModel: this.staffModel,
        },
        { UserMapper, DeliveryMapper, CustomerMapper, StaffMapper },
        this.logger
      );

      return updatedEntity;
    } catch (error) {
      this.logger.error(`Error updating user with ID=${id}: ${error.message}`);
      throw new Error(`Error updating user: ${error.message}`);
    }
  }


  // ✅ SAVE USER + PROFILE
  async save(user: UserEntity): Promise<UserEntity> {
    try {
      const userObj = UserMapper.toUserPersistence(user);
      const savedUser = await this.userModel.findOneAndUpdate(
        { ID: user.ID },
        userObj,
        { upsert: true, new: true }
      );
      (user as any)._id = savedUser._id;
      this.logger.debug(`User saved with _id=${savedUser._id}`);

      // Lưu profile theo userType
      switch (user.userType) {
        case UserType.DELIVERY:
          if (user.getDeliveryProfile()) {
            const deliveryObj = DeliveryMapper.toDeliveryPersistence(user.getDeliveryProfile(), user);
            await this.deliveryModel.updateOne({ user: user.get_Id() }, deliveryObj, { upsert: true });
          }
          break;
        case UserType.CUSTOMER:
          if (user.getCustomerProfile()) {
            const customerObj = CustomerMapper.toCustomerPersistence(user.getCustomerProfile(), user);
            await this.customerModel.updateOne({ user: user.get_Id() }, customerObj, { upsert: true });
          }
          break;
        case UserType.STAFF:
          if (user.getStaffProfile()) {
            const staffObj = StaffMapper.toStaffPersistence(user.getStaffProfile(), user);
            await this.staffModel.updateOne({ user: user.get_Id() }, staffObj, { upsert: true });
          }
          break;
      }

      return user;
    } catch (error) {
      this.logger.error(`Error saving user: ${error.message}`);
      throw new Error(`Error saving user: ${error.message}`);
    }
  }

  // ✅ FIND ALL USERS
  async findAll(): Promise<UserEntity[]> {
    try {
      const userDocs = await this.userModel.find().exec();
      if (!userDocs.length) return [];
      const users = await Promise.all(
        userDocs.map((doc) =>
          UserProfileHelper.attachProfile(
            doc,
            {
              deliveryModel: this.deliveryModel,
              customerModel: this.customerModel,
              staffModel: this.staffModel,
            },
            { UserMapper, DeliveryMapper, CustomerMapper, StaffMapper },
            this.logger
          )
        )
      );
      this.logger.debug(`findAll → Found ${users.length} users`);
      return users;
    } catch (error) {
      this.logger.error(`Error finding all users: ${error.message}`);
      throw new Error(`Error finding all users: ${error.message}`);
    }
  }

  // ✅ FIND ONE BY FILTER
  private async findOneByFilter(filter: Partial<{ ID: string; email: string; userType: UserType }>): Promise<UserEntity | null> {
    try {
      const userDoc = await this.userModel.findOne(filter).exec();
      if (!userDoc) return null;
      return UserProfileHelper.attachProfile(
        userDoc,
        {
          deliveryModel: this.deliveryModel,
          customerModel: this.customerModel,
          staffModel: this.staffModel,
        },
        { UserMapper, DeliveryMapper, CustomerMapper, StaffMapper },
        this.logger
      );
    } catch (error) {
      this.logger.error(`Error finding user by filter ${JSON.stringify(filter)}: ${error.message}`);
      throw new Error(`Error finding user by filter: ${error.message}`);
    }
  }

  // ✅ FIND BY ID
  async findById(id: string): Promise<UserEntity | null> {
    return this.findOneByFilter({ ID: id });
  }

  // ✅ FIND BY EMAIL
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOneByFilter({ email });
  }

  // ✅ DELETE USER + PROFILE
  async remove(id: string): Promise<void> {
    try {
      const user = await this.userModel.findOne({ ID: id }).exec();
      if (!user) {
        this.logger.warn(`User with ID ${id} not found for deletion`);
        return;
      }

      const profileMap = {
        [UserType.DELIVERY]: this.deliveryModel,
        [UserType.CUSTOMER]: this.customerModel,
        [UserType.STAFF]: this.staffModel,
      };

      const model = profileMap[user.userType];
      if (model) await model.deleteOne({ user: user._id }).exec();

      await this.userModel.deleteOne({ _id: user._id }).exec();
      this.logger.debug(`Deleted user with ID=${id}`);
    } catch (error) {
      this.logger.error(`Error deleting user by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  // ✅ FIND BY FILTERS (pagination + profile filters)
  async findByFilters(filters: any): Promise<any> {
    try {
      const query = UserQueryHelper.buildBaseQuery(filters);
      const { pageNum, limitNum, skip } = UserQueryHelper.getPagination(filters);

      if (filters.userType && Object.keys(filters).length > 0) {
        const userIds = await UserProfileHelper.findUserIdsByProfile(
          filters.userType,
          filters,
          {
            deliveryModel: this.deliveryModel,
            customerModel: this.customerModel,
            staffModel: this.staffModel,
          },
          this.logger
        );
        if (userIds.length) query._id = { $in: userIds };
      }

      const [userDocs, total] = await Promise.all([
        this.userModel.find(query).skip(skip).limit(limitNum).exec(),
        this.userModel.countDocuments(query).exec(),
      ]);

      if (!userDocs.length) return [];

      const users = await Promise.all(
        userDocs.map((doc) =>
          UserProfileHelper.attachProfile(
            doc,
            {
              deliveryModel: this.deliveryModel,
              customerModel: this.customerModel,
              staffModel: this.staffModel,
            },
            { UserMapper, DeliveryMapper, CustomerMapper, StaffMapper },
            this.logger
          )
        )
      );

      this.logger.debug(`Pagination → page=${pageNum}, limit=${limitNum}, skip=${skip}`);
      return {
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        users,
      };
    } catch (error) {
      this.logger.error(`Error finding users by filters: ${error.message}`);
      throw new Error(`Error finding users by filters: ${error.message}`);
    }
  }
}
