import React, { Fragment, useLayoutEffect } from 'react';
import { unstable_createRoot } from 'react-dom';
import { act } from 'react-dom/test-utils';

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
  let container = null;
  container = document.createElement('div');
  document.body.appendChild(container);

  let renderCounter = 0;

  const Component = () => {
    const hooked = hook.method(...hook.props);
    useLayoutEffect(() => {
      renderCounter += 1;
    });

    const actionKeys = Object.keys(actions);
    const actionStack = [];
    for (const actionKey of actionKeys) {
      const callback = actions[actionKey];
      actionStack.push(
        <button
          key={actionKey}
          data-testid={actionKey}
          onClick={(e) => {
            callback({ e, H: hooked });
          }}
        />
      );
    }

    const valueKeys = Object.keys(values);
    const valueStack = [];
    for (const valueKey of valueKeys) {
      const valueMapper = values[valueKey];
      valueStack.push(
        <span
          key={valueKey}
          data-testid={valueKey}
          children={valueMapper(hooked)}
        />
      );
    }

    return (
      <Fragment>
        {actionStack}
        {valueStack}
      </Fragment>
    );
  };

  const root = unstable_createRoot(container);
  act(() => {
    root.render(<Component />);
  });

  const getDOM = (key) => {
    if (!values[key]) {
      throw new ReferenceError(`Value key "${key}" is undefined`);
    }
    return container.querySelector(`[data-testid=${key}]`);
  };

  return {
    actions: (keyStack) => {
      if (!Array.isArray(keyStack)) {
        // This allows multiple actions to be invoked in the same `act()` callback
        keyStack = [keyStack];
      }
      act(() => {
        for (const key of keyStack) {
          if (!actions[key]) {
            throw new ReferenceError(`Action key "${key}" is undefined`);
          }
          const button = container.querySelector(`[data-testid=${key}]`);
          button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      });
    },
    getDOM,
    get: (key) => getDOM(key).textContent,
    getRenderCount: () => renderCounter,
    cleanup: () => {
      root.unmount(container);
      container.remove();
      container = null;
    },
  };
}

export function createCompoundHookInterface(collection = {}) {
  let container = null;
  container = document.createElement('div');
  document.body.appendChild(container);

  const renderStack = [],
    renderCounter = {},
    keyCache = {};
  const collectionKeys = Object.keys(collection);
  for (const collectionKey of collectionKeys) {
    renderCounter[collectionKey] = 0;
    const { hook = {}, actions = {}, values = {} } = collection[collectionKey];
    const ChildComponent = () => {
      const hooked = hook.method(...hook.props);
      useLayoutEffect(() => {
        renderCounter[collectionKey] += 1;
      });

      const actionKeys = Object.keys(actions);
      const actionStack = [];
      for (const actionKey of actionKeys) {
        const callback = actions[actionKey];
        actionStack.push(
          <button
            key={`${collectionKey}-${actionKey}`}
            data-testid={`${collectionKey}-${actionKey}`}
            onClick={(e) => {
              callback({ e, H: hooked });
            }}
          />
        );
      }

      const valueKeys = Object.keys(values);
      const valueStack = [];
      for (const valueKey of valueKeys) {
        const valueMapper = values[valueKey];
        valueStack.push(
          <span
            key={`${collectionKey}-${valueKey}`}
            data-testid={`${collectionKey}-${valueKey}`}
            children={valueMapper(hooked)}
          />
        );
      }

      keyCache[collectionKey] = { actionKeys, valueKeys };
      return (
        <Fragment>
          {actionStack}
          {valueStack}
        </Fragment>
      );
    };
    renderStack.push(<ChildComponent key={collectionKey} />);
  }

  const RootComponent = () => <div children={renderStack} />;
  const root = unstable_createRoot(container);
  act(() => {
    root.render(<RootComponent />);
  });

  const getDOM = (itemKey, subKey) => {
    if (!keyCache[itemKey].valueKeys.includes(subKey)) {
      throw new ReferenceError(
        `Value key "${subKey}" in item "${itemKey}" is undefined`
      );
    }
    return container.querySelector(`[data-testid=${itemKey}-${subKey}]`);
  };

  return {
    at: (itemKey) => {
      if (!collection[itemKey]) {
        throw new ReferenceError(`Item at key "${itemKey}" is undefined`);
      }
      return {
        actions: (subKeyStack) => {
          if (!Array.isArray(subKeyStack)) {
            // This allows multiple actions to be invoked in the same `act()` callback
            subKeyStack = [subKeyStack];
          }
          act(() => {
            for (const subKey of subKeyStack) {
              if (!keyCache[itemKey].actionKeys.includes(subKey)) {
                throw new ReferenceError(
                  `Action key "${subKey}" in item "${itemKey}" is undefined`
                );
              }
              const button = container.querySelector(
                `[data-testid=${itemKey}-${subKey}]`
              );
              button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
          });
        },
        getDOM: (subKey) => getDOM(itemKey, subKey),
        get: (subKey) => getDOM(itemKey, subKey).textContent,
        getRenderCount: () => renderCounter[itemKey],
      };
    },
    cleanup: () => {
      root.unmount(container);
      container.remove();
      container = null;
    },
  };
}
