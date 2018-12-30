
import { addAspect, addFunction } from '../lib';
import { AspectObjectLiteral, AspectFunctionBody, Selector } from '../lib/types';

export function a(selector: string, value: AspectObjectLiteral) {
    addAspect({ selector, value })
}

export function f(name: string, signature: Array<Selector>, body: AspectFunctionBody) {
    addFunction({ name, signature, body })
}