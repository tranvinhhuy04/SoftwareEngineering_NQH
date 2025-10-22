import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { IUserRepository } from "src/users/domain/respositories/user.repository";
import { UserEntity } from "src/users/domain/entities/user.entity";
import { UserType } from "src/users/domain/enum/user-type.enum";
import { UserSql } from "../database/sql/user.entity";
import { CustomerProfileSql } from "../database/sql/customerProfile.entity";
import { StaffProfileSql } from "../database/sql/staffProfile.entity";
import { DeliveryProfileSql } from "../database/sql/deliveryProfile.entity";
import { UserMapper } from "../mappers/user.mapper";
import { CustomerMapper } from "../mappers/customer.mapper";
import { StaffMapper } from "../mappers/staff.mapper";
import { DeliveryMapper } from "../mappers/delivery.mapper";
import { UpdateUserDto } from "src/users/application/dto/user/update-user.dto";

@Injectable()
export class UserRepositorySql implements IUserRepository {
  private readonly logger = new Logger(UserRepositorySql.name);

  constructor(
    @InjectRepository(UserSql)
    private readonly userRepo: Repository<UserSql>,

    @InjectRepository(CustomerProfileSql)
    private readonly customerRepo: Repository<CustomerProfileSql>,

    @InjectRepository(StaffProfileSql)
    private readonly staffRepo: Repository<StaffProfileSql>,

    @InjectRepository(DeliveryProfileSql)
    private readonly deliveryRepo: Repository<DeliveryProfileSql>,
  ) {}

  // ✅ SAVE USER + PROFILE
  async save(user: UserEntity): Promise<UserEntity> {
    try {
      const userRow = UserMapper.toUserPersistence(user);
      const savedUser = await this.userRepo.save(userRow); // ✅ lấy lại user đã lưu
      user.ID = savedUser.ID; // ✅ cập nhật ID vào entity
      this.logger.debug("user: ",user)
      switch (user.userType) {
        case UserType.CUSTOMER:
          if (user.getCustomerProfile()) {
            const profile = CustomerMapper.toCustomerPersistence(user.getCustomerProfile()!, user);
            this.logger.debug(`🟡 Saving customer profile = ${JSON.stringify(profile)}`);
            await this.customerRepo.save(profile);
          }
          break;

        case UserType.STAFF:
          if (user.getStaffProfile()) {
            const profile = StaffMapper.toStaffPersistence(user.getStaffProfile()!, user);
            this.logger.debug(`🟡 Saving staff profile = ${JSON.stringify(profile)}`);
            await this.staffRepo.save(profile);
          }
          break;

        case UserType.DELIVERY:
          this.logger.debug("delivery ",user.getDeliveryProfile())
         if (user.getDeliveryProfile()) {
            const profile = DeliveryMapper.toDeliveryPersistence(user.getDeliveryProfile()!, user);
            this.logger.debug(`🟡 Saving delivery profile = ${JSON.stringify(profile)}`);
            await this.deliveryRepo.save(profile);
          }
          break;
      }


      this.logger.debug(`Saved user ID=${user.ID} successfully`);
      return user;
    } catch (error) {
      this.logger.error(`Error saving user: ${error.message}`);
      throw new Error(`Error saving user: ${error.message}`);
    }
  }

  // ✅ UPDATE USER + PROFILE
  async update(id: string, user: UserEntity): Promise<UserEntity> {
    try {
      const existing = await this.userRepo.findOne({ where: { ID: id } });
      if (!existing) throw new Error(`User with ID=${id} not found`);

      const updatedUser = UserMapper.toUserPersistence(user);
      await this.userRepo.update({ ID: id }, updatedUser);

      switch (user.userType) {
        case UserType.CUSTOMER:
          if (user.getCustomerProfile()) {
            const profile = CustomerMapper.toCustomerPersistence(user.getCustomerProfile()!, user);
            await this.customerRepo.save(profile);
          }
          break;
        case UserType.STAFF:
          if (user.getStaffProfile()) {
            const profile = StaffMapper.toStaffPersistence(user.getStaffProfile()!, user);
            await this.staffRepo.save(profile);
          }
          break;
        case UserType.DELIVERY:
          if (user.getDeliveryProfile()) {
            const profile = DeliveryMapper.toDeliveryPersistence(user.getDeliveryProfile()!, user);
            await this.deliveryRepo.save(profile);
          }
          break;
      }

      const result = await this.findById(id);
      return result!;
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`);
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // ✅ FIND ALL USERS
  async findAll(): Promise<UserEntity[]> {
    try {
      const rows = await this.userRepo.find();
      const users = await Promise.all(
        rows.map(async (row) => {
          const user = UserMapper.toEntity(row);
          await this.attachProfile(user);
          return user;
        }),
      );
      return users;
    } catch (error) {
      this.logger.error(`Error fetching all users: ${error.message}`);
      throw error;
    }
  }

  // ✅ FIND BY ID
  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.userRepo.findOne({ where: { ID: id } });
    if (!row) return null;
    const user = UserMapper.toEntity(row);
    await this.attachProfile(user);
    return user;
  }

  // ✅ FIND BY EMAIL
  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.userRepo.findOne({ where: { email } });
    Logger.debug(email)
    if (!row) return null;
    const user = UserMapper.toEntity(row);
    Logger.debug(user)
    await this.attachProfile(user);
    return user;
  }

  // ✅ DELETE
  async remove(id: string): Promise<void> {
    try {
      const user = await this.findById(id);
      if (!user) return;

      switch (user.userType) {
        case UserType.CUSTOMER:
          await this.customerRepo.delete({ userId: user.ID });
          break;
        case UserType.STAFF:
          await this.staffRepo.delete({ userId: user.ID });
          break;
        case UserType.DELIVERY:
          await this.deliveryRepo.delete({ userId: user.ID });
          break;
      }

      await this.userRepo.delete({ ID: id });
      this.logger.debug(`Deleted user ID=${id}`);
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
      throw error;
    }
  }

  // ✅ SEARCH + PAGINATION (đơn giản hóa so với Mongo)
  async findByFilters(filters: any): Promise<any> {
    try {
      const qb = this.userRepo.createQueryBuilder("user");

      if (filters.name) qb.andWhere("user.name LIKE :name", { name: `%${filters.name}%` });
      if (filters.email) qb.andWhere("user.email LIKE :email", { email: `%${filters.email}%` });
      if (filters.userType) qb.andWhere("user.userType = :type", { type: filters.userType });
      if (filters.active) qb.andWhere("user.active = :active", { active: filters.active });

      const page = +filters.page || 1;
      const limit = +filters.limit || 10;

      qb.skip((page - 1) * limit).take(limit);

      const [data, total] = await qb.getManyAndCount();

      const users = await Promise.all(
        data.map(async (row) => {
          const user = UserMapper.toEntity(row);
          await this.attachProfile(user);
          return user;
        }),
      );

      return {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        users,
      };
    } catch (error) {
      this.logger.error(`Error searching users: ${error.message}`);
      throw error;
    }
  }

  // ✅ Helper: attach profile (tương tự Mongo)
  private async attachProfile(user: UserEntity): Promise<void> {
  switch (user.userType) {
    case UserType.CUSTOMER:
      const customer = await this.customerRepo.findOne({ where: { userId: user.ID } });
      const customerEntity = CustomerMapper.toEntity(customer);
      if (customerEntity) user.assignCustomerProfile(customerEntity);
      break;

    case UserType.STAFF:
      const staff = await this.staffRepo.findOne({ where: { userId: user.ID } });
      const staffEntity = StaffMapper.toEntity(staff);
      if (staffEntity) user.assignStaffProfile(staffEntity);
      break;

    case UserType.DELIVERY:
      Logger.debug(JSON.stringify(user))
      const delivery = await this.deliveryRepo.findOne({ where: { userId: user.ID } }); // ✅ FIXED
      this.logger.debug(delivery)
      const deliveryEntity = DeliveryMapper.toEntity(delivery);
      if (deliveryEntity) user.assignDeliveryProfile(deliveryEntity);
      break;
  }
}

}
