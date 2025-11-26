import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly primitiveTypes: any[] = [String, Boolean, Number, Array, Object];

  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    // Nếu không phải class (DTO) thì bỏ qua
    if (!metatype || this.primitiveTypes.includes(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors: ValidationError[] = await validate(object);

    if (errors.length > 0) {
      const messages: string[] = errors
        .map((err) => {
          // Chặn undefined
          const constraints = err.constraints as { [key: string]: string } | undefined;

          if (!constraints) {
            return []; // trả về mảng rỗng thay vì ''
          }

          return Object.values(constraints);
        })
        .flat();

      throw new BadRequestException(messages);
    }

    return value;
  }
}
