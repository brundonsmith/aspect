import { uuid } from '../utils/funcs';

export default abstract class AspectObject {
    id: string = uuid();
    name: string | null;
    type: Array<string>;
    parent: AspectObject|null = null;

    constructor(name: string|null, type: Array<string> = [], parent: AspectObject|null = null) {
        this.name = name;
        this.type = type;
        this.parent = parent;
    }

    abstract clone(): AspectObject
}
