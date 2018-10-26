
import AspectObject from './AspectObject';

export default class SelectorSegment {
    name: string | null;
    type: Array<string> | null;

    get identifier(): string {
        return `"${this.name}"${this.type ? this.type.map(type => `-${type}`) : ''}`
    }
    get specificity(): Array<number> {
        return [ this.name != null ? 1 : 0, this.type ? this.type.length : 0 ]
    }

    constructor(name: string|null = null, type: Array<string>|null = null) {
        this.name = name;
        this.type = type;
    }

    selects(obj: AspectObject): boolean {
        let matchesName = this.name == null || this.name === obj.name;
        let matchesType = this.type == null || this.type.every(typeString => obj.type.includes(typeString));

        return matchesName && matchesType;
    }

    static compare(segment1: SelectorSegment, segment2: SelectorSegment): number {
        let spec1 = segment1.specificity;
        let spec2 = segment2.specificity;

        for(let i = 0; i < spec1.length; i++) {
            if(spec1[i] !== spec2[i]) {
                return spec2[i] - spec1[i];
            }
        }

        return 0;
    }

}
