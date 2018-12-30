
export type ObjectSpace = Array<AspectObject>;

export type PrimitiveValue = string|number|boolean|null;
export type AspectObject = {
    id: number,
    parent: number|null,
    selector: Selector,
    value?: PrimitiveValue,
};

export type AspectObjectLiteral = {
    selector: Selector,
    value?: PrimitiveValue,
    children?: Array<AspectObjectLiteral>
};

export type Selector = string;
export type DirectSelector = string;

export type AspectFunction = {
    name: string,
    signature: Array<Selector>,
    body: AspectFunctionBody
};
export type AspectFunctionBody = (...args: Array<AspectObjectLiteral>) => AspectObjectLiteral;

export type Aspect = {
    selector: DirectSelector,
    value: AspectObjectLiteral,
};

export type ExtensionAspect = {
    selector: DirectSelector,
    parentSelector: AspectObjectLiteral,
};

export type EventListener = {
    selector: Selector,
    direct?: boolean,
    name: string,
    effects: Array<Event>,
};

export type Event = {
    selector: string,
    name: string,
    args: Array<AspectObjectLiteral>,
};