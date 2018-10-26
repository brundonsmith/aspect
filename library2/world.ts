Array.prototype.flat = function() {
    return this.reduce((all, segment) => all.concat(segment), [])
}

import { AspectObject, AspectObjectTemplate, AspectFunction, Selector, PrimitiveValue, Aspect, EventListener, Event } from './types';
import { matchesSelector, isDirect, withoutFinalDirectClause, finalDirectName } from './selectors';
import { evaluateFunctionInner } from './functions';

var nextId = 0;
const state: Array<AspectObject> = [ ]
const functions: Array<AspectFunction> = [];
const aspects: Array<Aspect> = [];
const eventListeners: Array<EventListener> = [];

// ----------------------------------------------------------------------------------------------------
// mutations

export function addObject(obj: AspectObjectTemplate) {
    state.push(...destructureObject(obj));
}

export function deleteObject(id: number) {
    state.filter(obj => !descendsFrom(obj, id));
}

export function overwriteObject(id: number, obj: AspectObjectTemplate) {
    deleteObject(id);

    let newState = destructureObject(obj);
    newState[0].id = id;
    state.push(...newState);

}

function descendsFrom(obj: AspectObject, parentId: number) {
    let focal: AspectObject|null = obj;
    while(focal != null) {
        if(focal.id === parentId) return true;
        focal = parentOf(focal);
    }
    return false;
}

function destructureObject(obj: AspectObjectTemplate, parent: number|null = null): Array<AspectObject> {
    let partialState: Array<AspectObject> = [];

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

    if(partialState.some(other => other.parent === parent && other.name === obj.name)) {
        throw new TypeError(`Can't create object with same parent and name as another object: \n${JSON.stringify(newObj)}`)
    } else {
        partialState.push(newObj);

        if(obj.children != null) {
            obj.children.map(child => destructureObject(child, id)).forEach(childState => partialState.push(...childState));
        }
    }

    return partialState;
}

export function addFunction(func: AspectFunction) {
    functions.push(func);
}

export function addAspect(aspect: Aspect) {
    if(isDirect(aspect.selector)) {
        aspects.push(aspect);
    } else {
        throw new TypeError(`Can't add aspect with selector "${aspect.selector}". Only selectors ending with a direct-child segment that has an explicit name are currently supported for aspects.`)
    }
}

export function addEventListener(eventListener: EventListener) {
    eventListeners.push(eventListener);
}



export function triggerEvent(event: Event) {
    let target = state.find(obj => obj.id === event.targetId) as AspectObject;

    if(event.name === 'assignment') {
        if(objectIsAtomic(event.args[0])) {
            target.value = event.args[0].value;
        } else {
            overwriteObject(target.id, event.args[0]);
        }
    }

    processEvent(event, target);
}

function processEvent(event: Event, obj: AspectObject) {

    // trigger event listeners
    eventListeners.filter(listener => matchesSelector(obj, listener.selector))
                  .forEach(listener => listener.triggers.forEach(event => triggerEvent(event)))

    // bubble
    let parent = parentOf(obj);
    if(parent != null) {
        processEvent(event, parent);
    }
}


// ----------------------------------------------------------------------------------------------------
// derivations

export function structuredState(): Array<AspectObjectTemplate> {
    return state.filter(obj => obj.parent == null).map(obj => reconstructedObject(state, obj));
}
function reconstructedObject(localState: Array<AspectObject>, root: AspectObject): AspectObjectTemplate {
    return {
        name: root.name || undefined,
        type: root.type,
        value: root.value,
        children: localState.filter(other => other.parent === root.id).map(obj => reconstructedObject(localState, obj))
    }
}

export function structuredComputedState(): Array<AspectObjectTemplate> {
    let cs = computedState();
    return cs.filter(obj => obj.parent == null).map(obj => reconstructedObject(cs, obj));
}
export function computedState() {
    return state.slice().concat(virtualState())
}
function virtualState() {
    return state.map(realObject => virtualChildren(realObject).map(child => destructureObject(child, realObject.id)).flat())
                .flat()
}
function virtualChildren(parentObj: AspectObject): Array<AspectObjectTemplate> {
    return aspects.filter(aspect => 
                            matchesSelector(parentObj, withoutFinalDirectClause(aspect.selector)) &&
                            !state.some(obj => 
                                obj.parent === parentObj.id && 
                                obj.name === finalDirectName(aspect.selector)))
                  .map(aspect => ({ 
                        ...{ name: finalDirectName(aspect.selector) }, 
                        ...aspect.value 
                  }))
}

export function selectAll(selector: Selector): Array<AspectObject> {
    return state.filter(obj => matchesSelector(obj, selector));
}

export function parentOf(obj: AspectObject) {
    return state.find(other => other.id === obj.parent) || null;
}

export function evaluateFunction(name: string, argSelectors: Array<Selector>): Array<AspectObject> {
    let func = functions.find(f => f.name === name) as AspectFunction;
    return evaluateFunctionInner(
        func.body, 
        argSelectors.map(selectAll)
                    .map((selection, index) => 
                        selection.filter(obj => matchesSelector(obj, func.signature[index]))
                    )
    )
}

export function objectIsAtomic(obj: AspectObject|AspectObjectTemplate) {
    return ['string', 'number', 'boolean'].some(t => typeof obj.value === t || (obj.type != null && obj.type.includes(t)));
}

addAspect({
    selector: `.vector3 > #x`,
    value: {
        value: 0
    }
})
addAspect({
    selector: `.vector3 > #y`,
    value: {
        value: 0
    }
})
addAspect({
    selector: `.vector3 > #z`,
    value: {
        value: 0
    }
})

/*
addFunction({
    name: 'sum',
    signature: [ '.vector3', '.vector3' ],
    body: (vector1, vector2) => ({
        type: [ 'vector3' ],
        children: [
            { value: vector1 } // TODO: Select all within
        ]
    })
})
*/

addObject({
    name: 'some-vector-1',
    type: [ 'vector3' ]
})

console.log('OUTPUT:')
console.log(JSON.stringify(structuredComputedState(), null, 2))