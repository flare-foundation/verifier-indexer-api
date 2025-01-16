import { prefix0x, unPrefix0x } from "@flarenetwork/mcc";
import { TransformFnParams } from "class-transformer";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformHash32({value}: TransformFnParams): any {
    if (typeof value !== 'string') {
        return value;
    }
    return prefix0x(value.toLowerCase()).toLowerCase()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformUnprefix0x({value}: TransformFnParams): any {
    if (typeof value !== 'string') {
        return value;
    }
    return unPrefix0x(value);
}