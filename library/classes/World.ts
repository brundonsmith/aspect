import Selector from "./Selector";
import Aspect from './Aspect';
import ValueAspect from './ValueAspect';
import AspectFunction from "./AspectFunction";
import AspectObjectPrimitive from "./AspectObjectPrimitive";
import { PrimitiveValue } from './AspectObjectPrimitive';
import AspectObjectSet from "./AspectObjectSet";
import AspectObject from "./AspectObject";

class World {
    static nextId: number = 0;
    static getId() {
        return this.nextId++;
    }

    state: AspectObjectSet = new AspectObjectSet(null, [], [], null);
    aspects: Array<Aspect> = [];
    functions: {
        [name: string]: AspectFunction
    } = {};

    init(state: AspectObjectSet) {
        this.state = state;
    }

    getValue<T extends AspectObject>(obj: AspectObjectPrimitive<T>): T|null {
        for(let i = 0; i < this.aspects.length; i++) {
            let aspect = this.aspects[i];
            if(aspect instanceof ValueAspect && aspect.selector.selects(obj)) {
                return aspect.value;
            }
        }

        return null;
    }

    addAspect(aspect: Aspect) {
        this.aspects.push(aspect);
        this.aspects.sort((aspect1, aspect2) => Selector.compare(aspect1.selector, aspect2.selector));
    }

    defineFunction(name: string, func: AspectFunction) {
        this.functions[name] = func;
    }

    getObjects(selector: Selector) {
        return this.state.getObjects(selector);
    }

    assign(selector: Selector, obj: AspectObject) {
        this.getObjects(selector).forEach(selected => {
            if(selected instanceof AspectObjectSet && obj instanceof AspectObjectSet) {
                selected.children = obj.children.map(child => child.clone());
            } else if(selected instanceof AspectObjectPrimitive && obj instanceof AspectObjectPrimitive) {
                selected.localValue = obj.localValue;
            } else {
                // TODO: Figure out what to do with type mismatches
            }
        })
    }

    triggerEvent(name: string, target: AspectObject, payload: AspectObject) {

    }
}

// TODO: Implement name uniqueness checking


const worldInstance = new World();
export default worldInstance as World;