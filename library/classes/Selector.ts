import SelectorSegment from "./SelectorSegment";
import AspectObject from "./AspectObject";

type SelectorCombinator = 'child'|'descendant';
function specificityOf(comb: SelectorCombinator): number {
    switch(comb) {
        case 'child': return 2;
        case 'descendant': return 1;
    }
}

export default class Selector {

    sequence: Array<SelectorSegment|SelectorCombinator>;

    get identifier(): string {
        return this.sequence.map(el => el instanceof SelectorSegment 
                                        ? el.identifier 
                                        : el.toString()).join(' ');
    }

    get last() {
        return this.sequence[this.sequence.length - 1];
    }

    constructor(sequence: Array<SelectorSegment|SelectorCombinator> = []) {
        this.sequence = sequence;
    }

    static compare(selector1: Selector, selector2: Selector): number {
        if(selector1.sequence.length > selector2.sequence.length) {
            return -1;
        } else if(selector2.sequence.length > selector1.sequence.length) {
            return 1;
        } else {
            for(let i = selector1.sequence.length - 1; i >= 0; i--) {
                let seg1 = selector1.sequence[i];
                let seg2 = selector2.sequence[i];
                let diff = 0;
                if(seg1 instanceof SelectorSegment && seg2 instanceof SelectorSegment) {
                    diff = SelectorSegment.compare(seg1, seg2);
                } else if(typeof seg1 === 'string' && typeof seg2 === 'string') {
                    diff = specificityOf(seg2) - specificityOf(seg1);
                }
                if(diff !== 0) {
                    return diff;
                }
            }
        }

        return 0;
    }

    selects(obj: AspectObject): boolean {
        let focalObj: AspectObject|null = obj;
        for(let i = this.sequence.length - 1; i >= 0 && focalObj != null; i--) {
            let segment = this.sequence[i];
            if(segment instanceof SelectorSegment) {
                if(!segment.selects(focalObj)) {
                    return false;
                }
            } else {
                switch(segment) {
                    case 'child': 
                        focalObj = focalObj.parent;
                        break;
                    case 'descendant': 
                        i--;
                        segment = this.sequence[i];
                        if(segment instanceof SelectorSegment) { // will always be true
                            while(focalObj != null && !segment.selects(focalObj)) {
                                focalObj = focalObj.parent;
                            }
                            if(focalObj == null) {
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
    static byName(n: string): Selector {
        return new Selector([ new SelectorSegment(n) ]);
    }
    static byType(t: Array<string>): Selector {
        return new Selector([ new SelectorSegment(null, t) ]);
    }
    byName(n: string): Selector {
        if(this.last instanceof SelectorSegment) {
            this.last.name = n;
            return this;
        } else {
            return new Selector(this.sequence.concat([ new SelectorSegment(n) ]));
        }
    }
    byType(t: Array<string>): Selector {
        if(this.last instanceof SelectorSegment) {
            this.last.type = t;
            return this;
        } else {
            return new Selector(this.sequence.concat([ new SelectorSegment(null, t) ]));
        }
    }
    child(): Selector {
        return new Selector(this.sequence.concat([ 'child' ]))
    }
    descendant(): Selector {
        return new Selector(this.sequence.concat([ 'descendant' ]))
    }

    static intersection(selector1: Selector, selector2: Selector): Selector {
        // TODO: implement
        return selector1;
    }
}