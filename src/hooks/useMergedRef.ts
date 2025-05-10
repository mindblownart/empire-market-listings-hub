
import * as React from "react";

/**
 * Custom hook that merges multiple refs into a single ref callback
 * Useful when you need to apply multiple refs to a single element
 */
export function useMergedRef<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return React.useCallback((value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  }, [refs]);
}
