// HACK: Flat isn't available
Array.prototype.flat = function() {
    return this.reduce((all, segment) => all.concat(segment), [])
}

import { AspectObject, AspectObjectLiteral, AspectFunction, Aspect, ExtensionAspect, 
    EventListener, Event, ObjectSpace } from './types';
import { matchesSelector, isDirect } from './selectors';
import { parent, destructureObject, objectIsPrimitive } from './space';

export { state, functions, aspects, eventListeners, addObject, overwriteObject, 
    addExtensionAspect, addAspect, addFunction, addEventListener, triggerEvent }

const state: ObjectSpace = [ ]
const functions: Array<AspectFunction> = [];
const aspects: Array<Aspect> = [];
const extensions: Array<ExtensionAspect> = [];
const eventListeners: Array<EventListener> = [];

// ----------------------------------------------------------------------------------------------------
// mutations
function addObject(obj: AspectObjectLiteral) {
    state.push(...destructureObject(obj));
}
/*
function deleteObject(id: number) {
    state.map((obj, index) => descendsFrom(state, obj, id))
        .forEach((shouldDelete) => state.splice(index, 1));
}*/
function overwriteObject(id: number, obj: AspectObjectLiteral) {
    //deleteObject(id);

    let newState = destructureObject(obj);
    newState[0].id = id;
    state.push(...newState);
}
function addFunction(func: AspectFunction) {
    functions.push(func);
}
function addExtensionAspect(aspect: ExtensionAspect) {
    extensions.push(aspect); // TODO: Utilize these
}
function addAspect(aspect: Aspect) {
    if(isDirect(aspect.selector)) {
        aspects.push(aspect);
    } else {
        throw new TypeError(`Can't add aspect with selector "${aspect.selector}". Only selectors ending with a direct-child segment that has an explicit name are currently supported for aspects.`)
    }
}
function addEventListener(eventListener: EventListener) {
    eventListeners.push(eventListener);
}
function triggerEvent(event: Event) {
    let targets = state.filter(obj => matchesSelector(state, obj, event.selector));

    targets.forEach(target => {
        if(event.name === 'assignment') {
            if(objectIsPrimitive(event.args[0])) {
                target.value = event.args[0].value;
            } else {
                overwriteObject(target.id, event.args[0]);
            }
        }
    
        processEvent(event, target);
    })
}

function processEvent(event: Event, obj: AspectObject) {

    // trigger event listeners
    eventListeners.filter(listener => matchesSelector(state, obj, listener.selector) && (!listener.direct || matchesSelector(state, obj, event.selector)))
                  .forEach(listener => listener.effects.forEach(event => triggerEvent(event)))

    // bubble
    let p = parent(state, obj);
    if(p != null) {
        processEvent(event, p);
    }
}
