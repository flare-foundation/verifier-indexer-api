import {
  Injectable,
  ValidationPipe,
  ValidationPipeOptions,
  Type,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class AbstractValidationPipe extends ValidationPipe {
  constructor(
    options: ValidationPipeOptions,
    private readonly targetTypes: { body?: Type; query?: Type; param?: Type },
  ) {
    super(options);
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    const targetType = this.targetTypes[metadata.type];
    if (!targetType) {
        const result = await super.transform(value, metadata);
      return result
    }
    const res = await super.transform(value, { ...metadata, metatype: targetType });
    return res;
  }
}
