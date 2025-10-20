import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '../use-cases/createUser.usecase';
import { IUserRepository } from '../../domain/respositories/user.repository';
import { USER_REPOSITORY } from '../../constants';
import { UserType } from '../../domain/enum/user-type.enum';
import { UserActive } from '../../domain/enum/user-active.enum';
import { Available } from '../../domain/enum/delivery-available.enum';
import { Vehicle } from '../../domain/enum/delivery-vehicle.enum';
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { IdGeneratorService } from '../../domain/services/id-generator.service';
import { StaffShift } from 'src/users/domain/enum/staff-shift.enum';
import { BcryptPasswordService } from 'src/users/infrastructure/services/bcrypt-password.service';
import { RpcException } from '@nestjs/microservices';
import { Types } from 'mongoose';

// ✅ Mock repository (không throw lỗi nữa)
class MockUserRepository implements IUserRepository {
  findById = jest.fn(async (id: string) => null);
  findByEmail = jest.fn(async (email: string) => null);
  findAll = jest.fn(async () => []);
  remove = jest.fn(async (id: string) => undefined);
  save = jest.fn(async (user: UserEntity) => user);
}

// ✅ Mock IdGeneratorService
jest.spyOn(IdGeneratorService, 'generateId').mockImplementation((userType) => {
  switch (userType) {
    case UserType.CUSTOMER:
      return 'C00001';
    case UserType.DELIVERY:
      return 'D00001';
    case UserType.STAFF:
      return 'S00001';
    default:
      return 'U00000';
  }
});

// ✅ Mock các phương thức generateProfileId khác
jest.spyOn(IdGeneratorService, 'generateDeliveryProfileId').mockReturnValue('DELIV001');
jest.spyOn(IdGeneratorService, 'generateStaffProfileId').mockReturnValue('STAF001');
jest.spyOn(IdGeneratorService, 'generateCustomerProfileId').mockReturnValue('CUST001');

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repo: MockUserRepository;
  let bcryptService: BcryptPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: USER_REPOSITORY, useClass: MockUserRepository },
        {
          provide: BcryptPasswordService,
          useValue: {
            hashPassword: jest.fn().mockResolvedValue('hashed_password'),
            comparePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    repo = module.get<MockUserRepository>(USER_REPOSITORY);
    bcryptService = module.get<BcryptPasswordService>(BcryptPasswordService);
  });

  // 🧩 POSITIVE CASES
  it('should create a CUSTOMER user with customerProfile', async () => {
    const dto: CreateUserDto = {
      name: 'Nguyen Van A',
      email: 'nva@example.com',
      password: 'password123',
      phone: '0901234567',
      address: '123 Le Loi, Q1, HCM',
      userType: UserType.CUSTOMER,
      active: UserActive.ACTIVE,
      customerProfile: {
        defaultAddress: '123 Le Loi, Q1, HCM',
        preferredPaymentMethod: 'MOMO',
        savedPaymentMethods: ['MOMO', 'COD'],
        favoriteItems: ['Burger', 'Pizza'],
      },
    };

    const user = await useCase.execute(dto);

    expect(user).toBeDefined();
    expect(user.ID).toBe('C00001');
    expect(bcryptService.hashPassword).toHaveBeenCalledWith('password123');
    expect(repo.save).toHaveBeenCalledWith(user);
  });

  it('should create a DELIVERY user with deliveryProfile', async () => {
    const dto: CreateUserDto = {
      name: 'Tran Thi B',
      email: 'tranb@example.com',
      password: 'password456',
      phone: '0908888999',
      address: '456 Tran Hung Dao, Q5, HCM',
      userType: UserType.DELIVERY,
      active: UserActive.ACTIVE,
      deliveryProfile: {
        available: Available.ASSIGN,
        vehicle_info: Vehicle.MOTORBIKE,
      },
    };

    const user = await useCase.execute(dto);

    expect(user).toBeDefined();
    expect(user.ID).toBe('D00001');
    expect(user.getDeliveryProfile()).toBeDefined();
    expect(user.getDeliveryProfile()?.vehicle_info).toBe(Vehicle.MOTORBIKE);
    expect(repo.save).toHaveBeenCalledWith(user);
  });

  it('should create a STAFF user with staffProfile', async () => {
    const dto: CreateUserDto = {
      name: 'Le Van C',
      email: 'le.c@example.com',
      password: 'password789',
      phone: '0905555666',
      address: '789 CMT8, Q10, HCM',
      userType: UserType.STAFF,
      active: UserActive.ACTIVE,
      staffProfile: {
        shift: StaffShift.MORNING,
        isActive: true,
        handledOrders: 5,
      },
    };

    const user = await useCase.execute(dto);

    expect(user).toBeDefined();
    expect(user.ID).toBe('S00001');
    expect(repo.save).toHaveBeenCalledWith(user);
  });

  // ❌ NEGATIVE CASES
  it('should throw error if email already exists', async () => {
    (repo.findByEmail as jest.Mock).mockResolvedValueOnce(new UserEntity(
        new Types.ObjectId(),
        'C00001',
        'Existing User',
        'nva@example.com',
        'hashed',
        '0900000000',
        'HCM',
        '',                     // ✅ avatar
        UserType.CUSTOMER,      // ✅ đúng vị trí userType
        UserActive.ACTIVE,      // ✅ đúng vị trí active
    ));

    const dto: CreateUserDto = {
      name: 'Duplicate Email',
      email: 'nva@example.com',
      password: 'password123',
      phone: '0901112222',
      address: 'HCM',
      userType: UserType.CUSTOMER,
      active: UserActive.ACTIVE,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(RpcException);
  });

  it('should throw error if email is missing', async () => {
    const dto: CreateUserDto = {
      name: 'Missing Email',
      email: '',
      password: 'test',
      phone: '0901112222',
      address: '1 Vo Thi Sau, HCM',
      userType: UserType.CUSTOMER,
      active: UserActive.ACTIVE,
    };

    // giả định CreateUserUseCase có validate (nếu không có bạn cần thêm vào logic)
    await expect(useCase.execute(dto)).rejects.toThrow();
  });

  it('should throw error when repository.save fails', async () => {
    repo.save.mockRejectedValueOnce(new Error('Database error'));

    const dto: CreateUserDto = {
      name: 'Repo Error',
      email: 'fail@example.com',
      password: 'password999',
      phone: '0900000000',
      address: '123 Error St',
      userType: UserType.CUSTOMER,
      active: UserActive.ACTIVE,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Database error');
  });
});
