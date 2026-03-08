// useDebounce.ts
import { useEffect, useState } from 'react';

/**
 * A custom hook that debounces a value.
 * @param value - The value to be debounced.
 * @param delay - The debounce delay in milliseconds.
 * @returns - The debounced value.
 */
function useDebounce(value: any, delay: number): any {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;