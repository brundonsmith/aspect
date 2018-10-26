import AspectObject from "./AspectObject";
import World from "./World";

export type PrimitiveValue = string|number|boolean;

export default class AspectObjectPrimitive<T extends PrimitiveValue> extends AspectObject {

    localValue: T|null = null;

    get computedValue(): T|null {
        if(this.localValue != null) {
            return this.localValue;
        } else {
            return World.getValue(this);
        }
    }

    constructor(name: string|null, type: Array<string> = [], value: T|null = null, parent: AspectObject|null = null) {
        super(name, type, parent);

        this.localValue = value;
    }

    clone(): AspectObjectPrimitive<T> {
        return new AspectObjectPrimitive(this.name, this.type.slice(), this.localValue);
    }
}
