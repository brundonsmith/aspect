
export type ObjectSpace = Array<AspectObject>;

export type PrimitiveValue = string|number|boolean|null;
export type AspectObject = {
    id: number,
    parent: number|null,
    name: string|null,
    type: Array<string>,
    value?: PrimitiveValue,
};

export type AspectObjectLiteral = {
    name?: string,
    type?: Array<string>,
    value?: PrimitiveValue,
    children?: Array<AspectObjectLiteral>
};

export type Selector = string;
export type DirectSelector = string;

export type AspectFunctionBody = (...args: Array<AspectObjectLiteral>) => AspectObjectLiteral;
export type AspectFunction = {
    name: string,
    signature: Array<Selector>,
    body: AspectFunctionBody
};

export type Aspect = {
    selector: DirectSelector,
    value: AspectObjectLiteral,
};

export type EventListener = {
    selector: Selector,
    triggers: Array<Event>,
};

export type Event = {
    name: string,
    targetId: number,
    args: Array<AspectObjectLiteral>,
};