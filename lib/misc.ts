import { PrimitiveValue, AspectObjectLiteral } from "./types";


export function primitiveLiteral(value: PrimitiveValue, name?: string): AspectObjectLiteral {
    return {
        name,
        type: [ typeof value ],
        value
    }
}