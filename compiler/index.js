
const parser = require('./grammar2');

let source = `
.vector3 > #x = 0 
.vector3 > #y = 0 
.vector3 > #z = 0 
.obj > #position = .vector3 
.obj > #name = 'Default name' 

sum(.vector3: one, .vector3: two) = .vector: [ 
    #x: one>#x + two>#x, 
    #y: one>#y + two>#y, 
    #z: one>#z + two>#z
]

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
    A.addObject(A.tokenized('.obj')[0][1])
    console.log(JSON.stringify(A.state, null, 2));
    console.log(JSON.stringify(A.reconstructedSpace(A.computedSpace(A.state, A.aspects)), null, 2));
`))