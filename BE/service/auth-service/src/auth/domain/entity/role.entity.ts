import { Types } from "mongoose";

export class Role {
  constructor(
    public readonly _id: Types.ObjectId,
    public readonly name: string,
    public readonly permissions: string[],
    public readonly description: string
  ) {}
}
