## 📂 `application/`

Thư mục **application** là **Application Layer** trong kiến trúc DDD (Domain-Driven Design).

Nó định nghĩa **Use Cases** – các hành động mà hệ thống có thể thực hiện từ góc nhìn nghiệp vụ.

Application layer:

* Không chứa **business logic phức tạp** (logic này nằm ở  **domain** ).
* Chỉ **phối hợp các domain services, entities, repositories** để thực thi một  **use case cụ thể** .
* Là **cầu nối** giữa `controller` (hoặc message handler trong microservices) với `domain`.

---

### 📁 Cấu trúc

```
application/
 └── use-cases/
       ├── create-user.usecase.ts
       ├── update-user.usecase.ts
       ├── find-user.usecase.ts
       └── delete-user.usecase.ts
```

---

### 📌 Ví dụ chi tiết

#### 1. **create-user.usecase.ts**

```ts
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: { name: string; email: string; role: string }): Promise<UserEntity> {
    // 1. Tạo entity từ input
    const user = new UserEntity(null, input.name, input.email, input.role);

    // 2. Gọi repository để lưu
    return await this.userRepository.save(user);
  }
}
```

---

#### 2. **update-user.usecase.ts**

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, updates: { name?: string; role?: string }) {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new NotFoundException(`User ${id} not found`);

    if (updates.name) existing.name = updates.name;
    if (updates.role) existing.role = updates.role;

    return await this.userRepository.save(existing);
  }
}
```

---

### 📌 Luồng hoạt động

1. **Controller** (hoặc message pattern trong microservices) nhận request.
2. Gọi **Use Case** trong `application/use-cases`.
3. Use Case sử dụng **domain entities, domain services, repositories** để thực thi logic.
4. Trả về **Entity** hoặc DTO cho tầng trên.

---
