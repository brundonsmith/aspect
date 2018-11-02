// HACK: Flat isn't available
Array.prototype.flat = function() {
    return this.reduce((all, segment) => all.concat(segment), [])
}

import { AspectObject, AspectObjectLiteral, AspectFunction, Aspect, EventListener, Event } from './types';
import { matchesSelector, isDirect } from './selectors';
import { parentOf, descendsFrom, destructureObject, objectIsPrimitive } from './space';

export { state, functions, aspects, eventListeners, addObject, overwriteObject, addAspect, addFunction, addEventListener, triggerEvent }

const state: Array<AspectObject> = [ ]
const functions: Array<AspectFunction> = [];
const aspects: Array<Aspect> = [];
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
    let target = state.find(obj => obj.id === event.targetId) as AspectObject;

    if(event.name === 'assignment') {
        if(objectIsPrimitive(event.args[0])) {
            target.value = event.args[0].value;
        } else {
            overwriteObject(target.id, event.args[0]);
        }
    }

    processEvent(event, target);
}

function processEvent(event: Event, obj: AspectObject) {

    // trigger event listeners
    eventListeners.filter(listener => matchesSelector(state, obj, listener.selector))
                  .forEach(listener => listener.triggers.forEach(event => triggerEvent(event)))

    // bubble
    let parent = parentOf(state, obj);
    if(parent != null) {
        processEvent(event, parent);
    }
}
