import batchedUpdates from './batch';
import deepCopy from './deep-copy';
import { createListener } from './listener';
import { createSuspenseWaiter } from './suspense-waiter';
import virtualBatch from './virtual-batch';

export function createStateHolder(specs) {
  const { key, default: defaultState, lifecycle = {}, options = {} } = specs;

  /**
   * @description State should be wrapped in this function whenever
   * it is received from or exposed to code outside of this library
   *
   * Every line of code that uses this method should also have a
   * "// (Receive)" or "// (Receive)" comment added to the end
   * For example:
   * state = copyState(newState); // (Receive)
   */
  const copyState = (s) => (options.mutable ? s : deepCopy(s));

  const initialState = copyState(defaultState); // (Receive)
  let state = copyState(defaultState); // (Receive)
  let shadowState; // Assignment deferred until first set occurs
  let isFirstSetOccured = false;

  const internalBatch = options.virtualBatch
    ? (callback) => {
        virtualBatch(() => {
          batchedUpdates(callback);
        });
      }
    : batchedUpdates;

  const performUpdate = (type, newState) => {
    const isReset = type === 1;
    const isHydrate = type === 2;
    shadowState = copyState(newState); // (Receive)
    internalBatch(() => {
      state = copyState(newState); // (Receive)
      M$listener.M$refresh();
      const isDidResetProvided = typeof lifecycle.didReset === 'function';
      const isDidSetProvided = typeof lifecycle.didSet === 'function';
      if (isReset) {
        if (isDidResetProvided) {
          lifecycle.didReset();
        }
      } else if (!isHydrate) {
        if (isDidSetProvided) {
          lifecycle.didSet({ state: copyState(state) }); // (Expose)
        }
      }
    });
  };

  // Note: when suspense hydration is complete, no need to batch
  // update because react is directly tracking the promise that
  // is thrown, when promise resolves, react automatically knows
  // to attempt to render the components again
  const M$listener = createListener();
  let suspenseWaiter;
  let hydrating = false;
  const M$hydrate = (callback) => {
    if (hydrating) {
      console.error(`Cannot hydrate source during a hydration (in "${key}")`);
      return;
    } // Early exit
    hydrating = true;
    if (options.suspense) {
      suspenseWaiter = createSuspenseWaiter(
        new Promise((resolve) => {
          const commit = (payload) => {
            // NOTE: `performUpdate` is not called here because components
            // will be re-rendered anyway when the promise resolved.
            // The state, however, must be copied
            state = copyState(payload); // (Receive)
            resolve();
            suspenseWaiter = undefined;
            hydrating = false;
          };
          callback({ commit });
        })
      );
    } else {
      const commit = (payload) => {
        performUpdate(2, payload);
        hydrating = false;
      };
      callback({ commit });
    }
  };

  if (typeof lifecycle.init === 'function') {
    M$hydrate(lifecycle.init);
  }

  return {
    M$listener,
    M$hydrate,
    M$suspenseOnHydration: () => {
      if (suspenseWaiter) {
        suspenseWaiter();
      }
    },
    M$get: () => copyState(state), // (Expose)
    M$set: (partialState) => {
      if (!isFirstSetOccured) {
        shadowState = copyState(state); // (Receive)
        isFirstSetOccured = true;
      }
      performUpdate(
        undefined,
        typeof partialState === 'function'
          ? partialState(copyState(shadowState)) // (Expose)
          : copyState(partialState) // (Receive)
      );
    },
    M$reset: () => {
      performUpdate(1, initialState);
    },
  };
}
