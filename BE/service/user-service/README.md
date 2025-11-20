
## 📂 Cấu trúc `src/` của `user-service`

```
src/
├── application/                  # Application Layer (Use Cases)
│   ├── dto/
│   │   ├── create-deliveryDetail.dto.ts
│   │   ├── update-deliveryDetail.dto.ts
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── use-cases/
│   │   ├── createUser.usecase.ts
│   │   ├── create-user.usecase.spec.ts   # Unit test cho use case
│   │   └── (có thể thêm update/find/delete)
│   └── interfaces/
│       └── user-services.interface.ts    # Định nghĩa cổng vào app layer
│
├── domain/                       # Domain Layer (Business logic cốt lõi)
│   ├── entities/
│   │   ├── user.entity.ts
│   │   └── deliveryDetail.entity.ts
│   ├── enums/
│   │   ├── delivery-available.enum.ts
│   │   ├── delivery-vehicle.enum.ts
│   │   ├── user-active.enum.ts
│   │   └── user-type.enum.ts
│   ├── repositories/
│   │   └── user.repository.ts          # Interface repo
│   └── services/
│       ├── id-generator.service.ts     # Domain service
│       └── password-service.interface.ts
│
├── infrastructure/               # Infrastructure Layer (Implementations)
│   ├── database/
│   │   ├── user.schema.ts
│   │   └── deliveryDetail.schema.ts
│   ├── mappers/
│   │   └── user.mapper.ts
│   ├── repositories/
│   │   └── user.repository.impl.ts     # Implement IUserRepository (Mongo)
│   └── services/
│       └── bcrypt-password.service.ts  # Implement PasswordService
│
├── presentation/                 # Presentation Layer (Interface Adapters)
│   └── users.controller.ts         # REST hoặc Message controller
│
├── constants.ts                   # Token, queue name, string constants
└── users.module.ts                # NestJS module: ghép 4 layer lại
```

---
