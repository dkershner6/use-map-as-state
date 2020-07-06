# useMapAsState

A React Hook to use JavaScript's Map as React State, using an identical interface. Uses Immer under the hood.

## Installation

```
npm i use-map-as-state
npm i immer
```

## Usage

```typescript
import useMapAsState from 'use-map-as-state';

const FunctionComponent = () => {
    const theMap = useMapAsState(new Map());

    return <p>{theMap.get('header')}</p>;
};
```

Note: The `set` function returns the NEXT state, even if the render has not occurred yet.
