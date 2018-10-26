import AspectObject from "./AspectObject";
import Selector from "./Selector";

export default class AspectObjectSet<T extends AspectObject = AspectObject> extends AspectObject {

    children: Array<T>;

    constructor(name: string|null, type: Array<string> = [], children: Array<T> = [], parent: AspectObject|null = null) {
        super(name, type, parent);

        children.forEach(obj => obj.parent = this);
        this.children = children;
    }

    
    clone(): AspectObjectSet {
        return new AspectObjectSet<T>(this.name, this.type.slice(), this.children.map(child => child.clone()) as Array<T>);
    }

    // TODO: Implement computed children
    getObjects(selector: Selector): Array<T> {
        return getAllObjectsRecursive(this).filter(obj => selector.selects(obj)) as Array<T>; // HACK: Type checking appeared to not be working correctly
    }
    getSingleObject(selector: Selector): T {
        return getAllObjectsRecursive(this).filter(obj => selector.selects(obj))[0] as T; // HACK: Type checking appeared to not be working correctly
    }

    
}
function getAllObjectsRecursive(obj: AspectObject): Array<AspectObject> {
    if(obj instanceof AspectObjectSet) {
        return obj.children.map(getAllObjectsRecursive)
                           .reduce((all, subset) => all.concat(subset), []).concat([ obj ]);
    } else {
        return [ obj ];
    }
}