
import { AspectObject, Selector, DirectSelector, ObjectSpace } from './types';
import { parentOf } from './space';

export { isDirect, finalDirectName, withoutFinalDirectClause, matchesSelector, tokenized }

function isDirect(selector: Selector) {
    let tokens = tokenized(selector);
    let lastToken = tokens[tokens.length - 1];

    return lastToken != null && 
           lastToken[0] === DIRECT_CHILD_CONJUNCTION && 
           lastToken[1].name != null
}

function finalDirectName(selector: DirectSelector) {
    let tokens = tokenized(selector);
    let lastToken = tokens[tokens.length - 1];

    if(lastToken != null && lastToken[1].name != null) {
        return lastToken[1].name;
    } else {
        return undefined;
    }
}

function withoutFinalDirectClause(selector: DirectSelector): Selector {
    if(isDirect(selector)) {
        let tokens = tokenized(selector);
        return serialized(tokens.slice(0, tokens.length - 1));
    } else {
        return selector;
    }
}

function matchesSelector(space: ObjectSpace, obj: AspectObject, selector: Selector) {
    let tokens = tokenized(selector).slice().reverse();

    // starting with lowermost selector
    let focalObj: AspectObject|null = obj;
    let i = 0;
    while(i < tokens.length && focalObj != null) {
        let conjunction = tokens[i][0];
        let segment = tokens[i][1];

        if(!matchesSelectorSegment(focalObj, segment)) {
            if(conjunction === DIRECT_CHILD_CONJUNCTION || conjunction == null) {
                return false;
            }
            if(conjunction === DESCENDANT_CONJUNCTION) {
                focalObj = parentOf(space, focalObj);
            }
        } else {
            i++;

            if(conjunction === DIRECT_CHILD_CONJUNCTION || conjunction === DESCENDANT_CONJUNCTION) {
                focalObj = parentOf(space, focalObj);
            }
        }
    }

    // terminated early
    if(i < tokens.length - 1) {
        return false;
    // survived all selector segments
    } else {
        return true;
    }
}

// no child/descendent selectors
function matchesSelectorSegment(obj: AspectObject, selectorToken: SegmentObj) {
    return (selectorToken.name == null || obj.name === selectorToken.name) && 
            selectorToken.type.every(t => obj.type.includes(t));
}

function tokenized(selector: Selector): Array<[ string, SegmentObj ]> {
    let segmentExp = /[\s]*([>|])?[\s]*([a-z0-9-#.]+)/gi;    
    let matchResults = [];
    let res;
    while(res = segmentExp.exec(selector)) {
        matchResults.push(res);
    }
    
    return matchResults.map(segment => [ 
        segment[1], // conjunction
        tokenizedSegment(segment[2]) // matcher
    ] as [string, SegmentObj] );
}

function tokenizedSegment(selectorSegment: Selector): SegmentObj {
    let name = undefined;
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

    return {
        name,
        type
    }
}

/** Convert tokens back into selector string */
function serialized(tokens: Array<[ string, SegmentObj ]>): string {
    return tokens.map(token => {
        let segment = '';
        if(token[0]) {
            segment += ` ${token[0]} `;
        }
        if(token[1].name) {
            segment += `${NAME_PREFIX}${token[1].name}`
        }
        token[1].type.slice().sort().forEach(type => segment += `${TYPE_PREFIX}${type}`)
        return segment;
    }).join('')
}

type SegmentObj = {
    name: string|undefined,
    type: Array<string>
}

const DIRECT_CHILD_CONJUNCTION = '>'
const DESCENDANT_CONJUNCTION = '|'

const NAME_PREFIX = '#'
const TYPE_PREFIX = '.'
