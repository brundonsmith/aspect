import { PrimitiveValue, AspectObjectLiteral } from "./types";

export function elet<T,R>(val: T, func: (val: T) => R): R {
    return func(val);
}

export function last<T>(arr: Array<T>): T|void {
    return arr[arr.length - 1];
}

export function primitiveLiteral(value: PrimitiveValue, name?: string): AspectObjectLiteral {
    return {
        selector: `${name ? `#${name}` : ''}.${typeof value}`,
        value
    }
}
