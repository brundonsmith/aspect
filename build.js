var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("library/utils/funcs", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function uuid() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    exports.uuid = uuid;
});
define("library/classes/AspectObject", ["require", "exports", "library/utils/funcs"], function (require, exports, funcs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AspectObject {
        constructor(name, type = [], parent = null) {
            this.id = funcs_1.uuid();
            this.parent = null;
            this.name = name;
            this.type = type;
            this.parent = parent;
        }
    }
    exports.default = AspectObject;
});
define("library/classes/SelectorSegment", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SelectorSegment {
        get identifier() {
            return `"${this.name}"${this.type ? this.type.map(type => `-${type}`) : ''}`;
        }
        get specificity() {
            return [this.name != null ? 1 : 0, this.type ? this.type.length : 0];
        }
        constructor(name = null, type = null) {
            this.name = name;
            this.type = type;
        }
        selects(obj) {
            let matchesName = this.name == null || this.name === obj.name;
            let matchesType = this.type == null || this.type.every(typeString => obj.type.includes(typeString));
            return matchesName && matchesType;
        }
        static compare(segment1, segment2) {
            let spec1 = segment1.specificity;
            let spec2 = segment2.specificity;
            for (let i = 0; i < spec1.length; i++) {
                if (spec1[i] !== spec2[i]) {
                    return spec2[i] - spec1[i];
                }
            }
            return 0;
        }
    }
    exports.default = SelectorSegment;
});
define("library/classes/Selector", ["require", "exports", "library/classes/SelectorSegment"], function (require, exports, SelectorSegment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    SelectorSegment_1 = __importDefault(SelectorSegment_1);
    function specificityOf(comb) {
        switch (comb) {
            case 'child': return 2;
            case 'descendant': return 1;
        }
    }
    class Selector {
        get identifier() {
            return this.sequence.map(el => el instanceof SelectorSegment_1.default
                ? el.identifier
                : el.toString()).join(' ');
        }
        get last() {
            return this.sequence[this.sequence.length - 1];
        }
        constructor(sequence = []) {
            this.sequence = sequence;
        }
        static compare(selector1, selector2) {
            if (selector1.sequence.length > selector2.sequence.length) {
                return -1;
            }
            else if (selector2.sequence.length > selector1.sequence.length) {
                return 1;
            }
            else {
                for (let i = selector1.sequence.length - 1; i >= 0; i--) {
                    let seg1 = selector1.sequence[i];
                    let seg2 = selector2.sequence[i];
                    let diff = 0;
                    if (seg1 instanceof SelectorSegment_1.default && seg2 instanceof SelectorSegment_1.default) {
                        diff = SelectorSegment_1.default.compare(seg1, seg2);
                    }
                    else if (typeof seg1 === 'string' && typeof seg2 === 'string') {
                        diff = specificityOf(seg2) - specificityOf(seg1);
                    }
                    if (diff !== 0) {
                        return diff;
                    }
                }
            }
            return 0;
        }
        selects(obj) {
            let focalObj = obj;
            for (let i = this.sequence.length - 1; i >= 0 && focalObj != null; i--) {
                let segment = this.sequence[i];
                if (segment instanceof SelectorSegment_1.default) {
                    if (!segment.selects(focalObj)) {
                        return false;
                    }
                }
                else {
                    switch (segment) {
                        case 'child':
                            focalObj = focalObj.parent;
                            break;
                        case 'descendant':
                            i--;
                            segment = this.sequence[i];
                            if (segment instanceof SelectorSegment_1.default) { // will always be true
                                while (focalObj != null && !segment.selects(focalObj)) {
                                    focalObj = focalObj.parent;
                                }
                                if (focalObj == null) {
                                    return false;
                                }
                            }
                            break;
                    }
                }
            }
            return true;
        }
        // Construction shortcuts
        static byName(n) {
            return new Selector([new SelectorSegment_1.default(n)]);
        }
        static byType(t) {
            return new Selector([new SelectorSegment_1.default(null, t)]);
        }
        byName(n) {
            if (this.last instanceof SelectorSegment_1.default) {
                this.last.name = n;
                return this;
            }
            else {
                return new Selector(this.sequence.concat([new SelectorSegment_1.default(n)]));
            }
        }
        byType(t) {
            if (this.last instanceof SelectorSegment_1.default) {
                this.last.type = t;
                return this;
            }
            else {
                return new Selector(this.sequence.concat([new SelectorSegment_1.default(null, t)]));
            }
        }
        child() {
            return new Selector(this.sequence.concat(['child']));
        }
        descendant() {
            return new Selector(this.sequence.concat(['descendant']));
        }
        static intersection(selector1, selector2) {
            // TODO: implement
            return selector1;
        }
    }
    exports.default = Selector;
});
define("library/classes/Aspect", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Aspect {
        constructor(selector) {
            this.selector = selector;
        }
    }
    exports.default = Aspect;
});
define("library/classes/ValueAspect", ["require", "exports", "library/classes/Aspect"], function (require, exports, Aspect_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Aspect_1 = __importDefault(Aspect_1);
    class ValueAspect extends Aspect_1.default {
        constructor(selector, value) {
            super(selector);
            this.value = value;
        }
    }
    exports.default = ValueAspect;
});
define("library/classes/AspectObjectSet", ["require", "exports", "library/classes/AspectObject"], function (require, exports, AspectObject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    AspectObject_1 = __importDefault(AspectObject_1);
    class AspectObjectSet extends AspectObject_1.default {
        constructor(name, type = [], children = [], parent = null) {
            super(name, type, parent);
            children.forEach(obj => obj.parent = this);
            this.children = children;
        }
        clone() {
            return new AspectObjectSet(this.name, this.type.slice(), this.children.map(child => child.clone()));
        }
        // TODO: Implement computed children
        getObjects(selector) {
            return getAllObjectsRecursive(this).filter(obj => selector.selects(obj)); // HACK: Type checking appeared to not be working correctly
        }
        getSingleObject(selector) {
            return getAllObjectsRecursive(this).filter(obj => selector.selects(obj))[0]; // HACK: Type checking appeared to not be working correctly
        }
    }
    exports.default = AspectObjectSet;
    function getAllObjectsRecursive(obj) {
        if (obj instanceof AspectObjectSet) {
            return obj.children.map(getAllObjectsRecursive)
                .reduce((all, subset) => all.concat(subset), []).concat([obj]);
        }
        else {
            return [obj];
        }
    }
});
define("library/classes/AspectFunction", ["require", "exports", "library/classes/Selector", "library/classes/World", "library/classes/AspectObjectSet"], function (require, exports, Selector_1, World_1, AspectObjectSet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Selector_1 = __importDefault(Selector_1);
    World_1 = __importDefault(World_1);
    AspectObjectSet_1 = __importDefault(AspectObjectSet_1);
    class AspectFunction {
        constructor(argSelectors, func) {
            this.argSelectors = argSelectors;
            this.func = func;
        }
        evaluate(...args) {
            return new AspectObjectSet_1.default(null, [], permutations(args.map(arg => arg instanceof Selector_1.default
                ? World_1.default.getObjects(arg)
                : [arg]))
                .map(argSet => this.func(...argSet)));
        }
    }
    exports.default = AspectFunction;
    function permutations(arrs) {
        var divisors = [];
        for (var i = arrs.length - 1; i >= 0; i--) {
            divisors[i] = divisors[i + 1] ? divisors[i + 1] * arrs[i + 1].length : 1;
        }
        let totalPermutations = arrs.map(a => a.length).reduce((total, len) => total * len, 1);
        let results = [];
        for (let n = 0; n < totalPermutations; n++) {
            var perm = [];
            var curArray;
            for (var i = 0; i < arrs.length; i++) {
                curArray = arrs[i];
                perm.push(curArray[Math.floor(n / divisors[i]) % curArray.length]);
            }
            results.push(perm);
        }
        return results;
    }
});
define("library/classes/AspectObjectPrimitive", ["require", "exports", "library/classes/AspectObject", "library/classes/World"], function (require, exports, AspectObject_2, World_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    AspectObject_2 = __importDefault(AspectObject_2);
    World_2 = __importDefault(World_2);
    class AspectObjectPrimitive extends AspectObject_2.default {
        constructor(name, type = [], value = null, parent = null) {
            super(name, type, parent);
            this.localValue = null;
            this.localValue = value;
        }
        get computedValue() {
            if (this.localValue != null) {
                return this.localValue;
            }
            else {
                return World_2.default.getValue(this);
            }
        }
        clone() {
            return new AspectObjectPrimitive(this.name, this.type.slice(), this.localValue);
        }
    }
    exports.default = AspectObjectPrimitive;
});
define("library/classes/World", ["require", "exports", "library/classes/Selector", "library/classes/ValueAspect", "library/classes/AspectObjectPrimitive", "library/classes/AspectObjectSet"], function (require, exports, Selector_2, ValueAspect_1, AspectObjectPrimitive_1, AspectObjectSet_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Selector_2 = __importDefault(Selector_2);
    ValueAspect_1 = __importDefault(ValueAspect_1);
    AspectObjectPrimitive_1 = __importDefault(AspectObjectPrimitive_1);
    AspectObjectSet_2 = __importDefault(AspectObjectSet_2);
    class World {
        constructor() {
            this.state = new AspectObjectSet_2.default(null, [], [], null);
            this.aspects = [];
            this.functions = {};
        }
        static getId() {
            return this.nextId++;
        }
        init(state) {
            this.state = state;
        }
        getValue(obj) {
            for (let i = 0; i < this.aspects.length; i++) {
                let aspect = this.aspects[i];
                if (aspect instanceof ValueAspect_1.default && aspect.selector.selects(obj)) {
                    return aspect.value;
                }
            }
            return null;
        }
        addAspect(aspect) {
            this.aspects.push(aspect);
            this.aspects.sort((aspect1, aspect2) => Selector_2.default.compare(aspect1.selector, aspect2.selector));
        }
        defineFunction(name, func) {
            this.functions[name] = func;
        }
        getObjects(selector) {
            return this.state.getObjects(selector);
        }
        assign(selector, obj) {
            this.getObjects(selector).forEach(selected => {
                if (selected instanceof AspectObjectSet_2.default && obj instanceof AspectObjectSet_2.default) {
                    selected.children = obj.children.map(child => child.clone());
                }
                else if (selected instanceof AspectObjectPrimitive_1.default && obj instanceof AspectObjectPrimitive_1.default) {
                    selected.localValue = obj.localValue;
                }
                else {
                    // TODO: Figure out what to do with type mismatches
                }
            });
        }
        triggerEvent(name, target, payload) {
        }
    }
    World.nextId = 0;
    // TODO: Implement name uniqueness checking
    const worldInstance = new World();
    exports.default = worldInstance;
});
define("brainstorming/library_test", ["require", "exports", "library/classes/World", "library/classes/ValueAspect", "library/classes/Selector", "library/classes/AspectFunction", "library/classes/AspectObjectPrimitive", "library/classes/AspectObjectSet"], function (require, exports, World_3, ValueAspect_2, Selector_3, AspectFunction_1, AspectObjectPrimitive_2, AspectObjectSet_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    World_3 = __importDefault(World_3);
    ValueAspect_2 = __importDefault(ValueAspect_2);
    Selector_3 = __importDefault(Selector_3);
    AspectFunction_1 = __importDefault(AspectFunction_1);
    AspectObjectPrimitive_2 = __importDefault(AspectObjectPrimitive_2);
    AspectObjectSet_3 = __importDefault(AspectObjectSet_3);
    World_3.default.addAspect(new ValueAspect_2.default(Selector_3.default.byType(['vector3']).child().byName('x').byType(['number']), 0));
    World_3.default.addAspect(new ValueAspect_2.default(Selector_3.default.byType(['vector3']).child().byName('y').byType(['number']), 0));
    World_3.default.addAspect(new ValueAspect_2.default(Selector_3.default.byType(['vector3']).child().byName('z').byType(['number']), 0));
    World_3.default.defineFunction('sqrt', new AspectFunction_1.default([Selector_3.default.byType(['number'])], (n) => new AspectObjectPrimitive_2.default(null, ['number'], Math.sqrt(n.computedValue))));
    World_3.default.defineFunction('square', new AspectFunction_1.default([Selector_3.default.byType(['number'])], (n) => new AspectObjectPrimitive_2.default(null, ['number'], n.computedValue * n.computedValue)));
    World_3.default.defineFunction('distance', new AspectFunction_1.default([Selector_3.default.byType(['vector3']), Selector_3.default.byType(['vector3'])], (v1, v2) => World_3.default.functions['sqrt'].evaluate(World_3.default.functions['square'].evaluate(new AspectObjectPrimitive_2.default(null, ['number'], v2.getSingleObject(Selector_3.default.byName('x')).computedValue -
        v1.getSingleObject(Selector_3.default.byName('x')).computedValue)).computedValue
        +
            World_3.default.functions['square'].evaluate(new AspectObjectPrimitive_2.default(null, ['number'], v2.getSingleObject(Selector_3.default.byName('y')).computedValue -
                v1.getSingleObject(Selector_3.default.byName('y')).computedValue)).computedValue
        +
            World_3.default.functions['square'].evaluate(new AspectObjectPrimitive_2.default(null, ['number'], v2.getSingleObject(Selector_3.default.byName('z')).computedValue -
                v1.getSingleObject(Selector_3.default.byName('z')).computedValue)).computedValue)));
    World_3.default.addAspect(new ValueAspect_2.default(Selector_3.default.byType(['transformable']).child().byName('position').byType(['vector3']), []));
    World_3.default.init(new AspectObjectSet_3.default(null, [], [
        new AspectObjectSet_3.default('some-vector-1', ['vector3'], [
            new AspectObjectPrimitive_2.default('x', ['number'], 0),
            new AspectObjectPrimitive_2.default('y', ['number'], 0),
            new AspectObjectPrimitive_2.default('z', ['number'], 0)
        ]),
        new AspectObjectSet_3.default('some-vector-2', ['vector3'], [
            new AspectObjectPrimitive_2.default('x', ['number'], 1),
            new AspectObjectPrimitive_2.default('y', ['number'], 1),
            new AspectObjectPrimitive_2.default('z', ['number'], 0)
        ]),
    ]));
});
define("library/classes/Event", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Event {
        constructor(name, target, payload) {
            this.name = name;
            this.target = target;
            this.payload = payload;
        }
    }
    exports.default = Event;
});
define("library/classes/Trigger", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Trigger {
    }
    exports.default = Trigger;
});
define("library/classes/TriggerAssignment", ["require", "exports", "library/classes/Trigger", "library/classes/World"], function (require, exports, Trigger_1, World_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Trigger_1 = __importDefault(Trigger_1);
    World_4 = __importDefault(World_4);
    class TriggerAssignment extends Trigger_1.default {
        constructor(selector, value) {
            super();
            this.selector = selector;
            this.value = value.clone();
        }
        invoke() {
            World_4.default.assign(this.selector, this.value.clone());
        }
    }
    exports.default = TriggerAssignment;
});
define("library2/types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("library2/functions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function evaluateFunctionInner(func, args) {
        return permutations(args).map(argSet => func(...argSet));
    }
    exports.evaluateFunctionInner = evaluateFunctionInner;
    function permutations(arrs) {
        var divisors = [];
        for (var i = arrs.length - 1; i >= 0; i--) {
            divisors[i] = divisors[i + 1] ? divisors[i + 1] * arrs[i + 1].length : 1;
        }
        let totalPermutations = arrs.map(a => a.length).reduce((total, len) => total * len, 1);
        let results = [];
        for (let n = 0; n < totalPermutations; n++) {
            var perm = [];
            var curArray;
            for (var i = 0; i < arrs.length; i++) {
                curArray = arrs[i];
                perm.push(curArray[Math.floor(n / divisors[i]) % curArray.length]);
            }
            results.push(perm);
        }
        return results;
    }
});
define("library2/world", ["require", "exports", "library2/selectors", "library2/functions"], function (require, exports, selectors_1, functions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var nextId = 0;
    const state = [];
    const functions = [];
    const aspects = [];
    const eventListeners = [];
    // ----------------------------------------------------------------------------------------------------
    // mutations
    function addObject(obj) {
        state.push(...destructureObject(obj));
    }
    exports.addObject = addObject;
    function deleteObject(id) {
        state.filter(obj => !descendsFrom(obj, id));
    }
    exports.deleteObject = deleteObject;
    function overwriteObject(id, obj) {
        deleteObject(id);
        let newState = destructureObject(obj);
        newState[0].id = id;
        state.push(...newState);
    }
    exports.overwriteObject = overwriteObject;
    function descendsFrom(obj, parentId) {
        let focal = obj;
        while (focal != null) {
            if (focal.id === parentId)
                return true;
            focal = parentOf(focal);
        }
        return false;
    }
    function destructureObject(obj, parent = null) {
        let partialState = [];
        let id = nextId++;
        let newObj = {
            id: id,
            parent: parent,
            name: obj.name,
            type: obj.type,
            value: obj.value
        };
        // allow implicit primitive typing
        if (newObj.value != null) {
            let primitiveType = typeof newObj.value;
            if (!newObj.type.includes(primitiveType)) {
                newObj.type.push(primitiveType);
            }
        }
        if (partialState.some(other => other.parent === parent && other.name === obj.name)) {
            throw new TypeError(`Can't create object with same parent and name as another object: \n${JSON.stringify(newObj)}`);
        }
        else {
            partialState.push(newObj);
            if (obj.children != null) {
                obj.children.map(child => destructureObject(child, id)).forEach(childState => partialState.push(...childState));
            }
        }
        return partialState;
    }
    function addFunction(func) {
        functions.push(func);
    }
    exports.addFunction = addFunction;
    function addAspect(aspect) {
        if (selectors_1.isDirect(aspect.selector)) {
            aspects.push(aspect);
        }
        else {
            throw new TypeError(`Can't add aspect with selector "${aspect.selector}". Only selectors ending with a direct-child segment that has an explicit name are currently supported for aspects.`);
        }
    }
    exports.addAspect = addAspect;
    function addEventListener(eventListener) {
        eventListeners.push(eventListener);
    }
    exports.addEventListener = addEventListener;
    function triggerEvent(event) {
        let target = state.find(obj => obj.id === event.targetId);
        if (event.name === 'assignment') {
            if (objectIsAtomic(event.args[0])) {
                target.value = event.args[0].value;
            }
            else {
                overwriteObject(target.id, event.args[0]);
            }
        }
        processEvent(event, target);
    }
    exports.triggerEvent = triggerEvent;
    function processEvent(event, obj) {
        // trigger event listeners
        eventListeners.filter(listener => selectors_1.matchesSelector(obj, listener.selector))
            .forEach(listener => listener.triggers.forEach(event => triggerEvent(event)));
        // bubble
        let parent = parentOf(obj);
        if (parent != null) {
            processEvent(event, parent);
        }
    }
    // ----------------------------------------------------------------------------------------------------
    // derivations
    function structuredState() {
        return state.filter(obj => obj.parent == null).map(reconstructedObject);
    }
    exports.structuredState = structuredState;
    function reconstructedObject(root) {
        return {
            name: root.name,
            type: root.type,
            value: root.value,
            children: state.filter(other => other.parent === root.id).map(reconstructedObject)
        };
    }
    function computedState() {
        return state.slice().concat(virtualState());
    }
    exports.computedState = computedState;
    function virtualState() {
        return state.map(realObject => virtualChildren(realObject).map(destructureObject).flat())
            .flat();
    }
    function virtualChildren(parentObj) {
        return aspects.filter(aspect => selectors_1.matchesSelector(parentObj, selectors_1.withoutFinalDirectClause(aspect.selector)) &&
            !state.some(obj => obj.parent === parentObj.id &&
                obj.name === selectors_1.finalDirectName(aspect.selector)))
            .map(aspect => aspect.value);
    }
    function selectAll(selector) {
        return state.filter(obj => selectors_1.matchesSelector(obj, selector));
    }
    exports.selectAll = selectAll;
    function parentOf(obj) {
        return state.find(other => other.id === obj.parent) || null;
    }
    exports.parentOf = parentOf;
    function evaluateFunction(name, argSelectors) {
        let func = functions.find(f => f.name === name);
        return functions_1.evaluateFunctionInner(func.body, argSelectors.map(selectAll)
            .map((selection, index) => selection.filter(obj => selectors_1.matchesSelector(obj, func.signature[index]))));
    }
    exports.evaluateFunction = evaluateFunction;
    function objectIsAtomic(obj) {
        return ['string', 'number', 'boolean'].some(t => obj.type.includes(t));
    }
    exports.objectIsAtomic = objectIsAtomic;
});
define("library2/selectors", ["require", "exports", "library2/world"], function (require, exports, world_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DIRECT_CHILD_CONJUNCTION = '>';
    const DESCENDANT_CONJUNCTION = '|';
    const NAME_PREFIX = '#';
    const TYPE_PREFIX = '.';
    // no child/descendent selectors
    function matchesSelectorSegment(obj, selectorSegment) {
        let name = null;
        let type = [];
        let exp = /([#.])([a-z0-9\-]+)/gi;
        let res;
        while (res = exp.exec(selectorSegment)) {
            if (res[1] === NAME_PREFIX) {
                name = res[2];
            }
            if (res[1] === TYPE_PREFIX) {
                type.push(res[2]);
            }
        }
        return obj.name === name && type.every(t => obj.type.includes(t));
    }
    exports.matchesSelectorSegment = matchesSelectorSegment;
    // with child/descendent selectors
    function matchesSelector(obj, selector) {
        let results = [];
        let exp = /[\s]*([>|])?[\s]*([a-z0-9-#.]+)/gi;
        let res;
        while (res = exp.exec(selector)) {
            results.push(res);
        }
        results.reverse();
        // starting with lowermost selector
        let focalObj = obj;
        let i = 0;
        while (i < results.length && focalObj != null) {
            let conjunction = results[i][1];
            let segment = results[i][2];
            if (!matchesSelectorSegment(focalObj, segment)) {
                if (conjunction === DIRECT_CHILD_CONJUNCTION || conjunction == null) {
                    return false;
                }
                if (conjunction === DESCENDANT_CONJUNCTION) {
                    focalObj = world_1.parentOf(focalObj);
                }
            }
            else {
                i++;
                if (conjunction === DIRECT_CHILD_CONJUNCTION || conjunction === DESCENDANT_CONJUNCTION) {
                    focalObj = world_1.parentOf(focalObj);
                }
            }
        }
        // terminated early
        if (i < results.length - 1) {
            return false;
            // survived all selector segments
        }
        else {
            return true;
        }
    }
    exports.matchesSelector = matchesSelector;
    function isDirect(selector) {
        let results = [];
        let exp = /[\s]*([>|])?[\s]*([a-z0-9-#.]+)/gi;
        let res;
        while (res = exp.exec(selector)) {
            results.push(res);
        }
        return results.length > 0 &&
            results[results.length - 1][1] === DIRECT_CHILD_CONJUNCTION &&
            results[results.length - 1][2].includes(NAME_PREFIX);
    }
    exports.isDirect = isDirect;
    function finalDirectName(selector) {
        let startIndex = selector.lastIndexOf(DIRECT_CHILD_CONJUNCTION) + 1;
        let endIndex = selector.length;
        if (selector.lastIndexOf(TYPE_PREFIX) > startIndex) {
            endIndex = selector.lastIndexOf(TYPE_PREFIX);
        }
        return selector.substr(startIndex, endIndex);
    }
    exports.finalDirectName = finalDirectName;
    function withoutFinalDirectClause(selector) {
        return selector.substr(0, selector.lastIndexOf(DIRECT_CHILD_CONJUNCTION));
    }
    exports.withoutFinalDirectClause = withoutFinalDirectClause;
});
define("library2/index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("library2/library2_tests", ["require", "exports", "library2/world"], function (require, exports, world_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    world_2.addAspect({
        selector: `vector3 > #x`,
        value: {
            name: null,
            type: ['number'],
            value: 0
        }
    });
    world_2.addAspect({
        selector: `vector3 > #y`,
        value: {
            name: null,
            type: ['number'],
            value: 0
        }
    });
    world_2.addAspect({
        selector: `vector3 > #z`,
        value: {
            name: null,
            type: ['number'],
            value: 0
        }
    });
    world_2.addObject({
        name: 'some-vector-1',
        type: ['vector3']
    });
    console.log(world_2.computedState());
});
