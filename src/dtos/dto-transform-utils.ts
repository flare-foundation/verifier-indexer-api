import { prefix0x, unPrefix0x } from '@flarenetwork/mcc';
import { TransformFnParams } from 'class-transformer';

export function transformHash32({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  return prefix0x(value.toLowerCase()).toLowerCase();
}

export function transformUnprefix0x({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  return unPrefix0x(value);
}
