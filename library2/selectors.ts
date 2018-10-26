
import { AspectObject, Selector, DirectSelector } from './types';
import { parentOf } from './world';

const DIRECT_CHILD_CONJUNCTION = '>'
const DESCENDANT_CONJUNCTION = '|'

const NAME_PREFIX = '#'
const TYPE_PREFIX = '.'

// no child/descendent selectors
export function matchesSelectorSegment(obj: AspectObject, selectorSegment: Selector) {
    let name = null;
    let type = [];

    let exp = /([#.])([a-z0-9\-]+)/gi;
    let res;
    while(res = exp.exec(selectorSegment)) {
        if(res[1] === NAME_PREFIX) {
            name = res[2];
        }
        if(res[1] === TYPE_PREFIX) {
            type.push(res[2]);
        }
    }

    return (name == null || obj.name === name) && 
            type.every(t => obj.type.includes(t));
}

// with child/descendent selectors
export function matchesSelector(obj: AspectObject, selector: Selector) {
    let results = [];

    let exp = /[\s]*([>|])?[\s]*([a-z0-9-#.]+)/gi;
    let res;
    while(res = exp.exec(selector)) {
        results.push(res);
    }
    results.reverse();

    // starting with lowermost selector
    let focalObj: AspectObject|null = obj;
    let i = 0;
    while(i < results.length && focalObj != null) {
        let conjunction = results[i][1];
        let segment = results[i][2];

        if(!matchesSelectorSegment(focalObj, segment)) {
            if(conjunction === DIRECT_CHILD_CONJUNCTION || conjunction == null) {
                return false;
            }
            if(conjunction === DESCENDANT_CONJUNCTION) {
                focalObj = parentOf(focalObj);
            }
        } else {
            i++;

            if(conjunction === DIRECT_CHILD_CONJUNCTION || conjunction === DESCENDANT_CONJUNCTION) {
                focalObj = parentOf(focalObj);
            }
        }
    }

    // terminated early
    if(i < results.length - 1) {
        return false;
    // survived all selector segments
    } else {
        return true;
    }
}

export function isDirect(selector: Selector) {
    let results = [];
    let exp = /[\s]*([>|])?[\s]*([a-z0-9-#.]+)/gi;
    let res;
    while(res = exp.exec(selector)) {
        results.push(res);
    }

    return results.length > 0 && 
           results[results.length - 1][1] === DIRECT_CHILD_CONJUNCTION && 
           results[results.length - 1][2].includes(NAME_PREFIX)
}

export function finalDirectName(selector: DirectSelector) {
    let lastSegment = selector.substr(selector.lastIndexOf(DIRECT_CHILD_CONJUNCTION) + 1);
    let match = lastSegment.match(/#[a-z0-9-]+/gi);

    if(match != null && match[0] != null) {
        return match[0].substr(1);
    } else {
        return undefined;
    }
}

export function withoutFinalDirectClause(selector: DirectSelector): Selector {
   return selector.substr(0, selector.lastIndexOf(DIRECT_CHILD_CONJUNCTION));
}
