import { useDebugValue, useReducer } from 'react';
import isEqual from 'react-fast-compare';
import { createStateHolder } from './state-holder';

// So that eslint sees it as the original useEffect
import useEffect from './use-isomorphic-layout-effect';

const STORE = {};

// NOTE:
// Factory pattern is used throughout the codebase because class method names are not mangled by
// Terser, this causes problems in production build where variable name mangling takes place

export function createSource(specs) {
  // Leniency: Allow numbers, but they will be treated as strings
  if (typeof specs.key !== 'string' && typeof specs.key !== 'number') {
    throw new TypeError(
      process.env.NODE_ENV === 'production'
        ? 1
        : 'Key must be a string (or number - will be casted into string)'
    );
  } else if (STORE[specs.key]) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(2);
    } else {
      console.error(
        `Duplicate source key "${specs.key}". This is a FATAL ERROR in production. But it is safe to ignore this warning if it occurred because of hot module replacement.`
      );
    }
  } else {
    // Only create state holder if key is provided and there are no duplicates
    STORE[specs.key] = createStateHolder(specs);
    return { key: specs.key };
  }
}

const forceUpdateReducer = (c) => c + 1;

export function useRelinkValue(source, selector) {
  STORE[source.key].M$suspenseOnHydration();
  const currentValue =
    typeof selector === 'function'
      ? selector(STORE[source.key].M$get())
      : STORE[source.key].M$get();

  useDebugValue(undefined, () =>
    process.env.NODE_ENV === 'production'
      ? undefined
      : {
        key: source.key,
        selector,
        value: currentValue,
      }
  );

  const [, forceUpdate] = useReducer(forceUpdateReducer, 0);
  useEffect(() => {
    const listenerId = STORE[source.key].M$listener.M$add(() => {
      const nextValue =
        typeof selector === 'function'
          ? selector(STORE[source.key].M$get())
          : STORE[source.key].M$get();
      if (!isEqual(currentValue, nextValue)) {
        forceUpdate();
      }
    });
    return () => {
      STORE[source.key].M$listener.M$remove(listenerId);
    };
  }, [currentValue, selector, source.key]);
  return currentValue;
}

export function useRelinkState(source, selector) {
  const state = useRelinkValue(source, selector);
  return [state, STORE[source.key].M$set];
}

export function useSetRelinkState(source) {
  STORE[source.key].M$suspenseOnHydration();
  return STORE[source.key].M$set;
}

export function useResetRelinkState(source) {
  STORE[source.key].M$suspenseOnHydration();
  return STORE[source.key].M$reset;
}

export function useRehydrateRelinkSource(source) {
  STORE[source.key].M$suspenseOnHydration();
  return STORE[source.key].M$hydrate;
}

export function dangerouslyGetRelinkValue(source) {
  return STORE[source.key].M$get();
}

export function dangerouslySetRelinkState(source, partialState) {
  STORE[source.key].M$set(partialState);
}

export function dangerouslyResetRelinkState(source) {
  STORE[source.key].M$reset();
}

export function dangerouslyRehydrateRelinkSource(source, callback) {
  STORE[source.key].M$hydrate(callback);
}
