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
import { StaffMapper } from "../mappers/staff.mapper";

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
  
    findAll(): Promise<UserEntity[]> {
        throw new Error("Method not implemented.");
    }
    remove(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

  /**
   * Save or update user (and delivery Profile if applicable)
   */
  async save(user: UserEntity): Promise<UserEntity> {
    try {
      const userObj = UserMapper.toUserPersistence(user);

      // Save or update User
      const userResult = await this.userModel.updateOne(
        { ID: user.ID },
        userObj,
        { upsert: true }
      );
      this.logger.debug(`User upsert result: ${JSON.stringify(userResult)}`);

      // If userType = DELIVERY → save deliveryProfile
      if (user.userType === UserType.DELIVERY && user.getDeliveryProfile()) {
        try {
          const deliveryObj = DeliveryMapper.toDeliveryPersistence(user.getDeliveryProfile(),user);
          const deliveryResult = await this.deliveryModel.updateOne({ user: user.get_Id() }, deliveryObj, { upsert: true });
          this.logger.debug(`DeliveryProfile upsert result: ${JSON.stringify(deliveryResult)}`);
        } catch (deliveryErr) {
          this.logger.error(`Error saving delivery Profile for user ${user.ID}: ${deliveryErr.message}`);
          throw new Error(`Error saving delivery Profile: ${deliveryErr.message}`);
        }
      }

      if (user.userType === UserType.CUSTOMER && user.getCustomerProfile()) {
        try {
          const customerObj = CustomerMapper.toCustomerPersistence(user.getCustomerProfile(), user);
          await this.customerProfileModel.updateOne({ user: user.get_Id() }, customerObj, { upsert: true });
        
        } catch (error) {
          this.logger.error(`Error saving customer Profile for user ${user.ID}: ${error.message}`);
          throw new Error(`Error saving customer Profile: ${error.message}`);
        }
      }

      if (user.userType === UserType.STAFF && user.getStaffProfile()) {
        try {
          const staffObj = StaffMapper.toStaffPersistence(user.getStaffProfile(), user);
          await this.staffProfileModel.updateOne({ user: user.get_Id() }, staffObj, { upsert: true });
        } catch (error) {
          this.logger.error(`Error saving staff Profile for user ${user.ID}: ${error.message}`);
          throw new Error(`Error saving staff Profile: ${error.message}`);
        }
      }

      return user;
    } catch (error) {
      this.logger.error(`Error saving user: ${error.message}`);
      throw new Error(`Error saving user: ${error.message}`);
    }
  }

  /**
   * Find user by filter (ID, email, or userType)
   */
  private async findOneByFilter(
    filter: Partial<{ ID: string; email: string; userType: UserType }>
  ): Promise<UserEntity | null> {
    try {
      const userDoc = await this.userModel.findOne(filter).exec();
      if (!userDoc) return null;

      let deliveryDoc: DeliveryProfileDocument | null = null;

      if (userDoc.userType === UserType.DELIVERY) {
        deliveryDoc = await this.deliveryModel
          .findOne({ user: userDoc._id })
          .exec();
      }

      return UserMapper.docToEntity(userDoc);
    } catch (error) {
      this.logger.error(`Error finding user by filter ${JSON.stringify(filter)}: ${error.message}`);
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
      return await this.findOneByFilter({ email });
    } catch (error) {
      this.logger.error(`Error finding user by email ${email}: ${error.message}`);
      throw error;
    }
  }

}
