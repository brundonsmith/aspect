import Selector from "./Selector";

export default abstract class Aspect {
    selector: Selector;

    constructor(selector: Selector) {
        this.selector = selector;
    }
}