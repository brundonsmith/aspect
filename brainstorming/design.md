
# Goals
- There are no references, only selectors of sets
- Mutation (event) on a set is applied to each member, individually (forEach)
- Function of a set returns another set (map)
- Function of multiple sets (multiple arguments) returns dot product of return values (N map)

# Other thoughts
- top level events which initiate a mutation:
    - program start
    - application lifecycle
    - user interactions
    - network events
    - time events


- Aspects must end with a direct child selector, so as to be deterministic about their location in the tree