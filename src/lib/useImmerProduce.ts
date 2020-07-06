import { produce, Draft } from 'immer';
import { useState, useRef } from 'react';

/**
 * The main advantage of this hook over useImmer, is that the updateValue function returns the nextValue (like produce).
 * This can be valuable in cases where you need to make mutations and immediately use the output.
 * Tests should be covered by a combination of use cases within this lib, and immer itself.
 * @param initialValue Any initial value
 */
const useImmerProduce = <T>(
    initialValue: T
): [T, (updater: (draft: Draft<T>) => void) => T, T] => {
    const [value, setValue] = useState(initialValue);
    const nextValue = useRef(initialValue);

    const updateValue = (updater: (draft: Draft<T>) => void): T => {
        nextValue.current = produce(nextValue.current, updater);
        setValue(nextValue.current);
        return nextValue.current;
    };

    return [value, updateValue, nextValue.current];
};

export default useImmerProduce;
