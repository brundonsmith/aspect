
.vector3 > #x = .number: 0
.vector3 > #y = .number: 0
.vector3 > #z = .number: 0

add([.vector3] vec1, [.vector3] vec2) = .vector3 
                                        #x: vec1 > #x + vec2 > #x,
                                        #y: vec1 > #y + vec2 > #y,
                                        #z: vec1 > #z + vec2 > #z

.obj > #position = .vector3

.damageable > #durability = 10
.damageable -> damage(target: [.damageable], amount: [.number])
    target > #durability := target > #durability - amount