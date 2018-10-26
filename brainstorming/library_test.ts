import World from '../library/classes/World';
import ValueAspect from '../library/classes/ValueAspect';
import Selector from '../library/classes/Selector';
import AspectFunction from '../library/classes/AspectFunction';
import AspectObjectPrimitive from '../library/classes/AspectObjectPrimitive';
import AspectObjectSet from '../library/classes/AspectObjectSet';

World.addAspect(new ValueAspect(
    Selector.byType(['vector3']).child().byName('x').byType(['number']),
    0
))
World.addAspect(new ValueAspect(
    Selector.byType(['vector3']).child().byName('y').byType(['number']),
    0
))
World.addAspect(new ValueAspect(
    Selector.byType(['vector3']).child().byName('z').byType(['number']),
    0
))


World.defineFunction('sqrt', new AspectFunction<AspectObjectPrimitive<number>>(
    [ Selector.byType([ 'number' ]) ],
    (n: AspectObjectPrimitive<number>) => 
        new AspectObjectPrimitive<number>(null, ['number'], Math.sqrt(n.computedValue) )
))

World.defineFunction('square', new AspectFunction(
    [ Selector.byType([ 'number' ]) ],
    (n: AspectObjectPrimitive<number>) => 
        new AspectObjectPrimitive<number>(null, ['number'], n.computedValue * n.computedValue)
))

World.defineFunction('distance', new AspectFunction(
    [ Selector.byType([ 'vector3' ]), Selector.byType([ 'vector3' ]) ],
    (v1: AspectObjectSet, v2: AspectObjectSet) => 
        World.functions['sqrt'].evaluate(
            World.functions['square'].evaluate(new AspectObjectPrimitive<number>(null, ['number'], 
                (v2.getSingleObject(Selector.byName('x')) as AspectObjectPrimitive<number>).computedValue - 
                (v1.getSingleObject(Selector.byName('x')) as AspectObjectPrimitive<number>).computedValue)
            ).computedValue
            +
            World.functions['square'].evaluate(new AspectObjectPrimitive<number>(null, ['number'], 
                (v2.getSingleObject(Selector.byName('y')) as AspectObjectPrimitive<number>).computedValue - 
                (v1.getSingleObject(Selector.byName('y')) as AspectObjectPrimitive<number>).computedValue)
            ).computedValue           
            +
            World.functions['square'].evaluate(new AspectObjectPrimitive<number>(null, ['number'], 
                (v2.getSingleObject(Selector.byName('z')) as AspectObjectPrimitive<number>).computedValue - 
                (v1.getSingleObject(Selector.byName('z')) as AspectObjectPrimitive<number>).computedValue)
            ).computedValue        
        )
))


World.addAspect(new ValueAspect(
    Selector.byType(['transformable']).child().byName('position').byType(['vector3']),
    []
))

World.init(new AspectObjectSet(null, [], [
    new AspectObjectSet('some-vector-1', ['vector3'], [
        new AspectObjectPrimitive<number>('x', ['number'], 0),
        new AspectObjectPrimitive<number>('y', ['number'], 0),
        new AspectObjectPrimitive<number>('z', ['number'], 0)
    ]),
    new AspectObjectSet('some-vector-2', ['vector3'], [
        new AspectObjectPrimitive<number>('x', ['number'], 1),
        new AspectObjectPrimitive<number>('y', ['number'], 1),
        new AspectObjectPrimitive<number>('z', ['number'], 0)
    ]),
]))