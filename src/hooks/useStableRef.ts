import { useRef } from "react";

/**
 * Returns a ref that always holds the latest value.
 * Useful for accessing callbacks in effects without adding them to deps.
 */
export function useStableRef<T>(value: T): { readonly current: T } {
    const ref = useRef(value);
    ref.current = value;
    return ref;
}
