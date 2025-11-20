
## 📂 `domain/`

Thư mục **domain** chứa phần cốt lõi nhất của hệ thống theo mô hình  **Domain-Driven Design (DDD)** .

Nó định nghĩa **ngôn ngữ nghiệp vụ (business language)** độc lập với framework, cơ sở dữ liệu hay giao thức truyền thông.

### 🎯 Mục tiêu

* Gom toàn bộ **business logic** của User Service vào một nơi rõ ràng, dễ test.
* Không phụ thuộc NestJS, Mongoose, hoặc bất kỳ công nghệ nào.
* Đảm bảo nếu đổi DB (Mongo → Postgres) hoặc framework thì domain không thay đổi.

---

### 📁 Cấu trúc

```
domain/
 ├── entities/
 │    └── user.entity.ts
 ├── repositories/
 │    └── user.repository.ts
 └── services/
      └── user-domain.service.ts
```

---

### 📌 Chi tiết các thành phần

#### 1. **Entities**

* Định nghĩa các  **đối tượng nghiệp vụ cốt lõi** .
* Ví dụ: `UserEntity` biểu diễn người dùng với các thuộc tính như `id`, `email`, `password`, `role`.
* Không chứa logic hạ tầng (DB query, framework decorators).
* Có thể chứa **business rule cơ bản** (ví dụ kiểm tra email hợp lệ).

👉 File: `entities/user.entity.ts`

```ts
export class UserEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public role: string,
  ) {}

  isAdmin(): boolean {
    return this.role === 'admin';
  }
}
```

---

#### 2. **Repositories**

* Định nghĩa **giao diện (interface)** để làm việc với dữ liệu User.
* Không quan tâm dữ liệu được lưu ở đâu (Mongo, SQL, file).
* Các lớp triển khai (impl) sẽ nằm ở `infrastructure/repositories`.

👉 File: `repositories/user.repository.ts`

```ts
import { UserEntity } from '../entities/user.entity';

export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
}
```

---

#### 3. **Domain Services**

* Chứa các **quy tắc nghiệp vụ phức tạp** không thuộc về một entity duy nhất.
* Dùng khi logic liên quan đến  **nhiều entities hoặc nghiệp vụ đặc biệt** .
* Ví dụ: `UserDomainService` kiểm tra khi tạo user mới có hợp lệ không.

👉 File: `services/user-domain.service.ts`

```ts
import { UserEntity } from '../entities/user.entity';

export class UserDomainService {
  validateNewUser(user: UserEntity): void {
    if (!user.email.includes('@')) {
      throw new Error('Invalid email');
    }
    if (user.role === 'admin' && !user.name) {
      throw new Error('Admin must have a name');
    }
  }
}
```

---
