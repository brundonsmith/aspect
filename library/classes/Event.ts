import AspectObject from "./AspectObject";

export default class Event {

    name: string;

    target: AspectObject;

    payload: AspectObject;
    
    constructor(name: string, target: AspectObject, payload: AspectObject) {
        this.name = name;
        this.target = target;
        this.payload = payload;
    }
}