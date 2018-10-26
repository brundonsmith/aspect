import Selector from "./Selector";
import World from "./World";
import AspectObject from "./AspectObject";
import AspectObjectSet from "./AspectObjectSet";

export default class AspectFunction<T extends AspectObject = AspectObject> {

    argSelectors: Array<Selector>;
    func: (...args: Array<AspectObject>) => T;

    constructor(argSelectors: Array<Selector>, func: (...args: Array<AspectObject>) => T) {
        this.argSelectors = argSelectors;
        this.func = func;
    }

    evaluate(...args: Array<Selector|AspectObject>): AspectObjectSet<T> {
        return new AspectObjectSet<T>(null, [], 
            permutations(args.map(arg => 
                arg instanceof Selector 
                    ? World.getObjects(arg)
                    : [ arg ] ))
            .map(argSet => this.func(...argSet)));
    }

}

function permutations<T>(arrs: Array<Array<T>>): Array<Array<T>> {
    var divisors: Array<number> = [];
    for (var i = arrs.length - 1; i >= 0; i--) {
        divisors[i] = divisors[i + 1] ? divisors[i + 1] * arrs[i + 1].length : 1;
    }

    let totalPermutations = arrs.map(a => a.length).reduce((total, len) => total * len, 1);
    let results = [];
    for(let n = 0; n < totalPermutations; n++) {
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