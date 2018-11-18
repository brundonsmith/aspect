
const parser = require('./grammar');

let source = `
.vector3 > #x = 0
.vector3 > #y = 0
.vector3 > #z = 0
.obj > #position = .vector3
`.trim()

console.log();
console.log('---- SOURCE ----')
console.log(source)

let compiled = parser.parse(source)

console.log();
console.log('---- COMPILED ----')
console.log(compiled)

console.log();
console.log('---- WORLD ----')
console.log(eval(compiled + `
    A.addObject(A.tokenized('.obj'))
    console.log(JSON.stringify(A.state, null, 2));
    console.log(JSON.stringify(A.reconstructedSpace(A.computedSpace(A.state, A.aspects)), null, 2));
`))