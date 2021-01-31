import { enableMapSet } from 'immer';
import { useImmerProduce } from 'use-immer-produce';

enableMapSet();

/**
 * This hook is useful when you have a series of unique values that needs its length manipulated frequently, but the values that need changing are an object.
 * It performs significantly better than arrays of objects for frequent manipulation and also holds ordering consistently.
 * This uses Immer under the hood, so be sure to pass new objects, arrays, and functions as values for proper re-rendering.
 * You will receive an error if you try to edit a value that won't create a re-render.
 * @param initialMap The initial @see Map to set.
 */
export const useMapAsState = <K, V>(initialMap?: Map<K, V>): Map<K, V> => {
    const [theMap, updateTheMap] = useImmerProduce(initialMap);

    const mapAsState: Map<K, V> = {
        /**
         * If you are passing an array, object, or function, you must create a new version of said object (copy) to re-render.
         * This is for performance reasons.
         */
        set: (key: K, value: V): Map<K, V> => {
            return updateTheMap((draft) => {
                // Immer has an issue with the type associated with Keys
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                draft.set(key, value);
            });
        },

        delete: (key: K): boolean => {
            let wasDeleted = false;
            updateTheMap((draft) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                wasDeleted = draft.delete(key);
            });
            return wasDeleted;
        },

        clear: (): void => {
            updateTheMap((draft) => {
                draft.clear();
            });
        },

        // Pass-through
        get: (key: K): V => theMap.get(key),

        // Use forEach if IE11 is important
        keys: (): IterableIterator<K> => theMap.keys(),

        values: (): IterableIterator<V> => {
            return theMap.values();
        },

        entries: (): IterableIterator<[K, V]> => theMap.entries(),

        forEach: (
            callbackfn: (value: V, key: K, map: Map<K, V>) => void,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            thisArg?: any
        ) => theMap.forEach(callbackfn, thisArg),

        get size() {
            return theMap.size;
        },

        has: (key: K) => theMap.has(key),

        // These are internal workings of the Map interface, can mostly ignore.
        [Symbol.iterator]: (): IterableIterator<[K, V]> =>
            theMap[Symbol.iterator](),

        get [Symbol.toStringTag]() {
            return theMap[Symbol.toStringTag];
        }
    };

    return mapAsState;
};

export default useMapAsState;
