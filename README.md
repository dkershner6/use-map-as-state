# useMapAsState

A React Hook to use JavaScript's Map as React State, using an identical interface. Uses Immer under the hood.

This is a very lightweight package, it only depends on one other, extremely lightweight React hook (besides Immer itself).

Total package size is ~3KB including TypeScript types.

## Installation

```
npm i use-map-as-state immer
```

## Usage

```typescript
import { useMapAsState } from 'use-map-as-state';

const FunctionComponent = () => {
    const theMap = useMapAsState(new Map());

    return <p>{theMap.get('header')}</p>;
};
```

Note: The `set` function returns the NEXT state, even if the render has not occurred yet.

```typescript
const onClick = () => {
    const draft = theMap.set('header', 'TestHeader);

    console.log(draft.get('header')); // TestHeader
}
```
