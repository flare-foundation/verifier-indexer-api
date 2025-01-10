import { prefix0x } from "@flarenetwork/mcc";
import { TransformFnParams } from "class-transformer";


export function transformHash32({value}: TransformFnParams): any {
    if (typeof value !== 'string') {
        return value;
    }
    return prefix0x(value.toLowerCase()).toLowerCase()
}