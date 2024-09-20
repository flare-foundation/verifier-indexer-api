/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validator constraint if the given value is a number or 0x-prefixed hexadecimal string.
 */
@ValidatorConstraint({ name: 'unsigned-int', async: false })
export class IsUnsignedIntLike implements ValidatorConstraintInterface {
  /**
   * Validates if the given value is a string of decimal unsigned number or 0x-prefixed hexadecimal string.
   * @param text
   * @param args
   * @returns
   */
  validate(text: any, _args: ValidationArguments) {
    return (
      typeof text === 'string' &&
      (/^0x[0-9a-fA-F]+$/i.test(text) || /^[0-9]+$/i.test(text))
    );
  }

  /**
   * Returns the default error message template.
   * @param args
   * @returns
   */
  defaultMessage(_args: ValidationArguments) {
    return '($property) value ($value) is not a decimal number in string or 0x-prefixed hexadecimal string';
  }
}

/**
 * Validator constraint if the given value is a number or 0x-prefixed hexadecimal string.
 */
@ValidatorConstraint({ name: 'signed-int', async: false })
export class IsSignedIntLike implements ValidatorConstraintInterface {
  /**
   * Validates if the given value is a number or 0x-prefixed hexadecimal string.
   * @param text
   * @param args
   * @returns
   */
  validate(text: any, _args: ValidationArguments) {
    return (
      typeof text === 'string' &&
      (/^-?0x[0-9a-fA-F]+$/i.test(text) || /^-?[0-9]+$/i.test(text))
    );
  }

  /**
   * Returns the default error message template.
   * @param args
   * @returns
   */
  defaultMessage(_args: ValidationArguments) {
    return '($property) value ($value) is not a signed decimal integer in string or signed 0x-prefixed hexadecimal string';
  }
}

/**
 * Validator constraint if the given value is a 0x-prefixed hexadecimal string representing 32 bytes.
 */
@ValidatorConstraint({ name: 'hash-32', async: false })
export class IsHash32 implements ValidatorConstraintInterface {
  /**
   * Validates if the given value is a 0x-prefixed hexadecimal string representing 32 bytes.
   * @param text
   * @param args
   * @returns
   */
  validate(text: any, _args: ValidationArguments) {
    return typeof text === 'string' && /^0x[0-9a-f]{64}$/i.test(text);
  }

  /**
   * Returns the default error message template.
   * @param args
   * @returns
   */
  defaultMessage(_args: ValidationArguments) {
    return '($property) value ($value) is not 0x-prefixed hexadecimal string representing 32 bytes';
  }
}

/**
 * Validator constraint if the given value is a 0x-prefixed hexadecimal string
 */
@ValidatorConstraint({ name: 'hash-0x', async: false })
export class Is0xHex implements ValidatorConstraintInterface {
  /**
   * Validates if the given value is a 0x-prefixed hexadecimal string
   * @param text
   * @param args
   * @returns
   */
  validate(text: any, _args: ValidationArguments) {
    return typeof text === 'string' && /^0x[0-9a-f]+$/i.test(text);
  }

  /**
   * Returns the default error message template.
   * @param args
   * @returns
   */
  defaultMessage(_args: ValidationArguments) {
    return '($property) value ($value) is not 0x-prefixed hexadecimal string';
  }
}

/**
 * Validator constraint if the given value is an EVM address, hence 0x-prefixed hexadecimal string representing 20 bytes.
 */
@ValidatorConstraint({ name: 'evm-address', async: false })
export class IsEVMAddress implements ValidatorConstraintInterface {
  /**
   * Validates if the given value is an EVM address, hence 0x-prefixed hexadecimal string representing 20 bytes.
   * @param text
   * @param args
   * @returns
   */
  validate(text: any, _args: ValidationArguments) {
    return typeof text === 'string' && /^0x[0-9a-f]{40}$/i.test(text);
  }

  /**
   * Returns the default error message template.
   * @param args
   * @returns
   */
  defaultMessage(_args: ValidationArguments) {
    return '($property) value ($value) is not 0x-prefixed hexadecimal string representing 20 bytes (EVM address)';
  }
}
