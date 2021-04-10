import React, { Fragment, useLayoutEffect } from 'react';
import { act, create } from 'react-test-renderer';

/**
 * @description A wrapper for testing React Hooks by abstracting the DOM container's logic.
 * @param {object} config
 * @param {object} config.hook
 * @param {Function} config.hook.method
 * @param {Array<any>} config.hook.props
 * @param {Object.<Function>} config.actions
 * @param {Object.<Function>} config.values
 */
export function createHookInterface({ hook = {}, actions = {}, values = {} }) {
  let renderCount = 0;
  let dispatchableActions = {};
  let retrievableValues = {};

  const Component = () => {
    const providedHook = hook.method(...hook.props);
    useLayoutEffect(() => {
      renderCount += 1;
    });

    const actionKeys = Object.keys(actions);
    dispatchableActions = {};
    for (const actionKey of actionKeys) {
      const callback = actions[actionKey];
      dispatchableActions[actionKey] = () => {
        callback({ H: providedHook });
      };
    }

    const valueKeys = Object.keys(values);
    retrievableValues = {};
    for (const valueKey of valueKeys) {
      const valueMapper = values[valueKey];
      // All values should be casted to string
      retrievableValues[valueKey] = '' + valueMapper(providedHook);
    }

    return null;
  };

  let root;
  act(() => {
    root = create(<Component />);
  });

  return {
    actions: (actionKeyStack) => {
      if (!Array.isArray(actionKeyStack)) {
        // This allows multiple actions to be invoked in the same `act()` callback
        actionKeyStack = [actionKeyStack];
      }
      act(() => {
        // Array of actions are batched in one `act()`
        for (const actionKey of actionKeyStack) {
          if (!dispatchableActions[actionKey]) {
            throw new ReferenceError(`Action "${actionKey}" is undefined`);
          }
          dispatchableActions[actionKey]();
        }
      });
    },
    get: (valueKey) => {
      if (!retrievableValues[valueKey]) {
        throw new ReferenceError(`Value "${valueKey}" is undefined`);
      }
      return retrievableValues[valueKey];
    },
    getRenderCount: () => renderCount,
    cleanup: root.unmount,
  };
}

export function createCompoundHookInterface(channels = {}) {
  const renderStack = [];
  const renderCount = {};
  const outlets = {};

  const channelKeys = Object.keys(channels);
  for (const channelKey of channelKeys) {
    renderCount[channelKey] = 0;
    outlets[channelKey] = {
      dispatchableActions: {},
      retrievableValues: {},
    };
    const { hook = {}, actions = {}, values = {} } = channels[channelKey];

    const ChildComponent = () => {
      const providedHook = hook.method(...hook.props);
      useLayoutEffect(() => {
        renderCount[channelKey] += 1;
      });

      const actionKeys = Object.keys(actions);
      outlets[channelKey].dispatchableActions = {};
      for (const actionKey of actionKeys) {
        const callback = actions[actionKey];
        outlets[channelKey].dispatchableActions[actionKey] = () => {
          callback({ H: providedHook });
        };
      }

      const valueKeys = Object.keys(values);
      outlets[channelKey].retrievableValues = {};
      for (const valueKey of valueKeys) {
        const valueMapper = values[valueKey];
        // All values should be casted to string
        outlets[channelKey].retrievableValues[valueKey] =
          '' + valueMapper(providedHook);
      }

      return null;
    };

    renderStack.push(<ChildComponent key={channelKey} />);
  }

  let root;
  act(() => {
    root = create(<Fragment children={renderStack} />);
  });

  return {
    at: (channelKey) => {
      if (!outlets[channelKey]) {
        throw new ReferenceError(`Channel "${channelKey}" is undefined`);
      }
      return {
        actions: (actionKeyStack) => {
          if (!Array.isArray(actionKeyStack)) {
            // This allows multiple actions to be invoked in the same `act()` callback
            actionKeyStack = [actionKeyStack];
          }
          act(() => {
            // Array of actions are batched in one `act()`
            for (const actionKey of actionKeyStack) {
              if (!outlets[channelKey].dispatchableActions[actionKey]) {
                throw new ReferenceError(
                  `Action "${actionKey}" in "${channelKey}" is undefined`
                );
              }
              outlets[channelKey].dispatchableActions[actionKey]();
            }
          });
        },
        get: (valueKey) => outlets[channelKey].retrievableValues[valueKey],
        getRenderCount: () => renderCount[channelKey],
      };
    },
    cleanup: root.unmount,
  };
}

// NOTE: Not yet tested
export function createHocInterface({ entry, actions = {}, values = {} }) {
  let renderCount = 0;
  let dispatchableActions = {};
  let retrievableValues = {};

  class Component extends React.Component {
    constructor(props) {
      super(props);

      const actionKeys = Object.keys(actions);
      dispatchableActions = {};
      for (const actionKey of actionKeys) {
        const callback = actions[actionKey];
        dispatchableActions[actionKey] = () => {
          callback({ props });
        };
      }

      const valueKeys = Object.keys(values);
      retrievableValues = {};
      for (const valueKey of valueKeys) {
        const valueMapper = values[valueKey];
        // All values should be casted to string
        retrievableValues[valueKey] = '' + valueMapper(props);
      }
    }

    componentDidMount() {
      renderCount += 1;
    }

    render() {
      return null;
    }
  }

  let root;
  act(() => {
    // Parameters are first applied then passed in as a component, example
    // entry: ({ C }) => withHoc(<C />, options)
    root = create(entry({ C: Component }));
  });

  return {
    actions: (actionKeyStack) => {
      if (!Array.isArray(actionKeyStack)) {
        // This allows multiple actions to be invoked in the same `act()` callback
        actionKeyStack = [actionKeyStack];
      }
      act(() => {
        // Array of actions are batched in one `act()`
        for (const actionKey of actionKeyStack) {
          if (!dispatchableActions[actionKey]) {
            throw new ReferenceError(`Action "${actionKey}" is undefined`);
          }
          dispatchableActions[actionKey]();
        }
      });
    },
    get: (valueKey) => {
      if (!retrievableValues[valueKey]) {
        throw new ReferenceError(`Value "${valueKey}" is undefined`);
      }
      return retrievableValues[valueKey];
    },
    getRenderCount: () => renderCount,
    cleanup: root.unmount,
  };
}
