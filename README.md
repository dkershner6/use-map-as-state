# useMapAsState

A React Hook to use JavaScript's Map as React State, using an identical interface. Uses Immer under the hood.

This is a very lightweight package, it only depends on one other, extremely lightweight React hook (besides Immer itself).

Total package size is ~3KB including TypeScript types.

## Installation

```
npm i use-map-as-state immer
```

## Usage

You interact with the Map exactly as you would a normal map, but all of the render safety and immutability is handled for you.

```typescript
import { useMapAsState } from 'use-map-as-state';

const FunctionComponent = () => {
    const theMap = useMapAsState(new Map([['header', 'Not clicked.']]));

    const handleHeaderClick = () => {
        theMap.set('header', 'You clicked me.');
    };

    return <h1 onClick={handleHeaderClick}>{theMap.get('header')}</h1>;
};
```

## Draft Usage

Note: The `set` function returns the NEXT state, even if the render has not occurred yet.

```typescript
const onClick = () => {
    console.log(theMap.get('header')); // Whatever the previous value was

    const draft = theMap.set('header', 'TestHeader);

    console.log(theMap.get('header')); // STILL whatever the previous value was
    console.log(draft.get('header')); // TestHeader
}
```
