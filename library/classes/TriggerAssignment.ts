import Trigger from "./Trigger";
import Selector from "./Selector";
import AspectObject from "./AspectObject";
import World from "./World";

export default class TriggerAssignment extends Trigger {
    
    selector: Selector;

    value: AspectObject;

    constructor(selector: Selector, value: AspectObject) {
        super();

        this.selector = selector;
        this.value = value.clone();
    }

    invoke() {
        World.assign(this.selector, this.value.clone());
    }
}