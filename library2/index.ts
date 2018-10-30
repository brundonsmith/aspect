
import { state, aspects, addAspect, addObject, addFunction, functions } from './world';
import { reconstructedSpace, computedSpace, evaluateFunction } from './space';
import { primitiveLiteral } from './misc';
import { AspectObjectLiteral } from './types';

addAspect({
    selector: `.vector3 > #x`,
    value: {
        value: 0
    }
})
addAspect({
    selector: `.vector3 > #y`,
    value: {
        value: 0
    }
})
addAspect({
    selector: `.vector3 > #z`,
    value: {
        value: 0
    }
})

addFunction({
    name: 'sum',
    signature: [ '.vector3', '.vector3' ],
    body: (vector1, vector2) => ({
        type: [ 'vector3' ],
        children: [
            // @ts-ignore
            primitiveLiteral(vector1.children.find(child => child.name === 'x').value + vector2.children.find(child => child.name === 'x').value),
            // @ts-ignore
            primitiveLiteral(vector1.children.find(child => child.name === 'y').value + vector2.children.find(child => child.name === 'y').value),
            // @ts-ignore
            primitiveLiteral(vector1.children.find(child => child.name === 'z').value + vector2.children.find(child => child.name === 'z').value),
        ]
    })
})


addObject({
    name: 'vec1',
    type: [ 'vector3' ]
})

addObject({
    name: 'vec2',
    type: [ 'vector3' ],
    children: [
        primitiveLiteral(1, 'x'),
        primitiveLiteral(1, 'y'),
        primitiveLiteral(1, 'z'),
    ]
})

console.log('Literal state:')
console.log(JSON.stringify(reconstructedSpace(state), null, 2))

console.log('\nComputed state:')
console.log(JSON.stringify(reconstructedSpace(computedSpace(state, aspects)), null, 2))

console.log(JSON.stringify(evaluateFunction(computedSpace(state, aspects), functions, 'sum', [ '#vec1.vector3', '#vec2.vector3' ]), null, 2))