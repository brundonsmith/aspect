import { ObjectSpace, AspectObject, AspectObjectLiteral, Aspect, Selector, AspectFunction } from './types';
import { matchesSelector, withoutFinalDirectClause, finalDirectName, type, name } from './selectors';
import { evaluateFunctionInner } from './functions';

export function reconstructedSpace(space: ObjectSpace): Array<AspectObjectLiteral> {
    return space.filter(obj => obj.parent == null).map(obj => reconstructedObject(space, obj));
}
function reconstructedObject(space: ObjectSpace, root: AspectObject): AspectObjectLiteral {
    return {
        selector: root.selector,
        value: root.value,
        children: space.filter(other => other.parent === root.id).map(obj => reconstructedObject(space, obj))
    }
}

/** Given a baseline space, compute the expanded, virtual space */
export function computedSpace(space: ObjectSpace, aspects: Array<Aspect>) {
    return space.slice()
            .concat(
                space.map(realObject => 
                    virtualChildren(space, aspects, realObject).map(child => 
                        destructureObject(child, realObject.id)
                    ).flat()
                ).flat()
            )
}
function virtualChildren(space: ObjectSpace, aspects: Array<Aspect>, parentObj: AspectObject): Array<AspectObjectLiteral> {
    return aspects.filter(aspect => 
                            matchesSelector(space, parentObj, withoutFinalDirectClause(aspect.selector)) &&
                            !space.some(obj => 
                                obj.parent === parentObj.id && 
                                name(obj.selector) === finalDirectName(aspect.selector)))
                  .map(aspect => ({ 
                        ...{ name: finalDirectName(aspect.selector) }, 
                        ...aspect.value 
                  }))
}

export function select(space: ObjectSpace, selector: Selector, ancestor?: AspectObject): ObjectSpace {
    return space.filter(obj => (ancestor == null || descendsFrom(space, obj, ancestor.id)) 
                            && matchesSelector(space, obj, selector));
}

/** Get the parent of obj within space */
export function parent(space: ObjectSpace, obj: AspectObject) {
    return space.find(other => other.id === obj.parent) || null;
}

/** Whether this obejct is a string, number, or boolean type */
export function objectIsPrimitive(obj: AspectObject|AspectObjectLiteral) {
    return ['string', 'number', 'boolean'].some(t => typeof obj.value === t || type(obj.selector).includes(t));
}

export function descendsFrom(space: ObjectSpace, obj: AspectObject, parentId: number) {
    let focal: AspectObject|null = obj;
    while(focal != null) {
        if(focal.id === parentId) return true;
        focal = parent(space, focal);
    }
    return false;
}

var nextId = 0;
export function destructureObject(obj: AspectObjectLiteral, parent: number|null = null): Array<AspectObject> {
    let partialSpace: Array<AspectObject> = [];

    let id = nextId++;
    let newObj = {
        id: id,
        parent: parent,
        selector: obj.selector,
        value: obj.value
    };

    // allow implicit primitive typing
    if(newObj.value != null) {
        let primitiveType = typeof newObj.value;
        if(!type(newObj.selector).includes(primitiveType)) {
            type(newObj.selector).push(primitiveType);
        }
    }

    if(partialSpace.some(other => other.parent === parent && name(other.selector) === name(obj.selector))) {
        throw new TypeError(`Can't create object with same parent and name as another object: \n${JSON.stringify(newObj)}`)
    } else {
        partialSpace.push(newObj);

        if(obj.children != null) {
            obj.children.map(child => destructureObject(child, id)).forEach(childSpace => partialSpace.push(...childSpace));
        }
    }

    return partialSpace;
}

export function evaluateFunction(space: ObjectSpace, functions: Array<AspectFunction>, name: string, argSelectors: Array<Selector>): Array<AspectObjectLiteral> {
    let func = functions.find(f => f.name === name) as AspectFunction;
    return evaluateFunctionInner(
        func.body, 
        argSelectors.map(selector => select(space, selector)) // get current arguments being passed
                    .map((selection, index) =>  // refine by function argument constraints
                        selection.filter(obj => matchesSelector(space, obj, func.signature[index]))
                    )
                    .map(selection => selection.map(obj => reconstructedObject(space, obj))) // construct literals
    )
}

export function equals() {
    
}