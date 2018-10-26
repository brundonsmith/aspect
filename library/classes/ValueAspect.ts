import Selector from "./Selector";
import Aspect from './Aspect';
import AspectObject from './AspectObject';


export default class ValueAspect extends Aspect {

    value: AspectObject;

    constructor(selector: Selector, value: AspectObject) {
        super(selector);
        this.value = value;
    }
}