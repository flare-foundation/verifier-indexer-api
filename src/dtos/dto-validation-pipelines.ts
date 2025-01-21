import {
  ArgumentMetadata,
  Injectable,
  Type,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

@Injectable()
export class AbstractValidationPipe<T, K> extends ValidationPipe {
  constructor(
    options: ValidationPipeOptions,
    private readonly targetTypes: { body?: Type; query?: Type; param?: Type },
  ) {
    super(options);
  }

  async transform(value: T, metadata: ArgumentMetadata): Promise<K> {
    const targetType = this.targetTypes[metadata.type] as Type;
    if (!targetType) {
      const result = (await super.transform(value, metadata)) as K;
      return result;
    }
    const res = (await super.transform(value, {
      ...metadata,
      metatype: targetType,
    })) as K;
    return res;
  }
}
