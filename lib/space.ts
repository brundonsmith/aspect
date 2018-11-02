import { ObjectSpace, AspectObject, AspectObjectLiteral, Aspect, Selector, AspectFunction } from './types';
import { matchesSelector, withoutFinalDirectClause, finalDirectName } from './selectors';
import { evaluateFunctionInner } from './functions';

export function reconstructedSpace(space: ObjectSpace): Array<AspectObjectLiteral> {
    return space.filter(obj => obj.parent == null).map(obj => reconstructedObject(space, obj));
}
function reconstructedObject(space: ObjectSpace, root: AspectObject): AspectObjectLiteral {
    return {
        name: root.name || undefined,
        type: root.type,
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
                                obj.name === finalDirectName(aspect.selector)))
                  .map(aspect => ({ 
                        ...{ name: finalDirectName(aspect.selector) }, 
                        ...aspect.value 
                  }))
}

export function select(space: ObjectSpace, selector: Selector): ObjectSpace {
    return space.filter(obj => matchesSelector(space, obj, selector));
}

export function parentOf(space: ObjectSpace, obj: AspectObject) {
    return space.find(other => other.id === obj.parent) || null;
}

/** Whether this obejct is a string, number, or boolean type */
export function objectIsPrimitive(obj: AspectObject|AspectObjectLiteral) {
    return ['string', 'number', 'boolean'].some(t => typeof obj.value === t || (obj.type != null && obj.type.includes(t)));
}

export function descendsFrom(space: ObjectSpace, obj: AspectObject, parentId: number) {
    let focal: AspectObject|null = obj;
    while(focal != null) {
        if(focal.id === parentId) return true;
        focal = parentOf(space, focal);
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
        name: obj.name || null,
        type: obj.type || [],
        value: obj.value
    };

    // allow implicit primitive typing
    if(newObj.value != null) {
        let primitiveType = typeof newObj.value;
        if(!newObj.type.includes(primitiveType)) {
            newObj.type.push(primitiveType);
        }
    }

    if(partialSpace.some(other => other.parent === parent && other.name === obj.name)) {
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