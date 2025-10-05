import { Types } from 'mongoose';
import { UserMapper } from './user.mapper';
import { CreateUserDto } from 'src/users/application/dto/user/create-user.dto';
import { UserType } from 'src/users/domain/enum/user-type.enum';
import { UserActive } from 'src/users/domain/enum/user-active.enum';
import { DeliveryProfileEntity } from 'src/users/domain/entities/deliveryProfile.entity';
import { StaffProfileEntity } from 'src/users/domain/entities/staffProfile.entity';
import { UserEntity } from 'src/users/domain/entities/user.entity';
import { Vehicle } from 'src/users/domain/enum/delivery-vehicle.enum';
import { Available } from 'src/users/domain/enum/delivery-available.enum';
import { DeliveryMapper } from './delivery.mapper';
import { CustomerMapper } from './customer.mapper';
import { StaffMapper } from './staff.mapper';

describe('UserMapper', () => {
  const userId = new Types.ObjectId();
  const deliveryId = new Types.ObjectId();
  const staffId = new Types.ObjectId();

  const baseUser = new UserEntity(
    userId,
    'U00001',
    'Nguyen Van A',
    'nva@example.com',
    'hashedpw',
    '0901112222',
    'HCM',
    '',
    UserType.CUSTOMER,
    UserActive.ACTIVE,
  );

  // ===============================================
  it('should map UserDto to Entity', () => {
    const dto: CreateUserDto = {
      name: 'Tran B',
      email: 'tranb@example.com',
      password: 'pw',
      phone: '0909999999',
      address: 'Hanoi',
      userType: UserType.STAFF,
      active: UserActive.ACTIVE,
    };

    const user = UserMapper.mapperUserDtoToEntity(dto, 'S00001');
    expect(user).toBeInstanceOf(UserEntity);
    expect(user.ID).toBe('S00001');
    expect(user.name).toBe('Tran B');
    expect(user.userType).toBe(UserType.STAFF);
  });

  // ===============================================
  it('should map DeliveryDto to DeliveryProfileEntity', () => {
    const dto = { available: Available.ASSIGN, vehicle_info: Vehicle.MOTORBIKE };
    const delivery = DeliveryMapper.mapperDeliveryDtoToEntity(dto, baseUser, 'DEL001');

    expect(delivery).toBeInstanceOf(DeliveryProfileEntity);
    expect(delivery.ID).toBe('DEL001');
    expect(delivery.available).toBe(Available.ASSIGN);
  });

  // ===============================================
  it('should map StaffDto to StaffProfileEntity', () => {
    const dto = { shift: 'MORNING', isActive: true, handledOrders: 3 };
    const staff = StaffMapper.mapperStaffDtoToEntity(dto, baseUser, 'STF001');

    expect(staff).toBeInstanceOf(StaffProfileEntity);
    expect(staff.ID).toBe('STF001');
    expect(staff.handledOrders).toBe(3);
  });

  // ===============================================
  it('should map CustomerDto to plain object', () => {
    const dto = {
      defaultAddress: '123 ABC',
      preferredPaymentMethod: 'MOMO',
      savedPaymentMethods: ['MOMO'],
      favoriteItems: ['Pizza'],
    };

    const customer = CustomerMapper.mapperCustomerDtoToEntity(dto, baseUser, 'CUST001');
    expect(customer.ID).toBe('CUST001');
    expect(customer.defaultAddress).toBe('123 ABC');
    expect(customer.savedPaymentMethods.length).toBe(1);
  });

  // ===============================================
  it('should handle empty dto in CustomerMapper gracefully', () => {
    const customer = CustomerMapper.mapperCustomerDtoToEntity(undefined, baseUser, 'CUST002');
    expect(customer.ID).toBe('CUST002');
    expect(customer.savedPaymentMethods).toEqual([]);
    expect(customer.favoriteItems).toEqual([]);
  });

  // ===============================================
  it('should map Entity to persistence object', () => {
    const obj = UserMapper.toUserPersistence(baseUser);
    expect(obj.email).toBe('nva@example.com');
    expect(obj.userType).toBe(UserType.CUSTOMER);
  });

  // ===============================================
  it('should map doc to Entity (DELIVERY)', () => {
    const deliveryDoc = {
      _id: deliveryId,
      ID: 'DEL001',
      available: Available.ASSIGN,
      vehicle_info: Vehicle.MOTORBIKE,
    };
    const userDoc = {
      _id: userId,
      ID: 'U00001',
      name: 'Nguyen Van A',
      email: 'nva@example.com',
      password: 'hashedpw',
      phone: '0901112222',
      address: 'HCM',
      userType: UserType.DELIVERY,
      active: 'ACTIVE',
    };

    const user = UserMapper.docToEntity(userDoc);
    expect(user).toBeInstanceOf(UserEntity);
    expect(user.getDeliveryProfile()).toBeDefined();
  });
});
