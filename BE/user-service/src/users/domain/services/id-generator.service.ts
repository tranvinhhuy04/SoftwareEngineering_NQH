import { UserType } from "../enum/user-type.enum";

export class IdGeneratorService {
  private static counters: Record<string, number> = {};

  private static prefixMap: Record<UserType, string> = {
      [UserType.STAFF]: "S",
      [UserType.CUSTOMER]: "C",
      [UserType.DELIVERY]: "D",
      [UserType.RESTAURANT_ADMIN]: "A",
  };

  private static readonly PAD_LENGTH = 5;

  static generateId(userType: UserType): string {
    const prefix = this.prefixMap[userType] ?? "U";

    // Sử dụng nullish coalescing để gọn hơn
    this.counters[prefix] = (this.counters[prefix] ?? 0) + 1;

    return `${prefix}${String(this.counters[prefix]).padStart(this.PAD_LENGTH, "0")}`;
  }

  static resetCounter(userType: UserType): void {
    const prefix = this.prefixMap[userType] ?? "U";
    this.counters[prefix] = 0;
  }
}
