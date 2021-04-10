import { UNSTABLE_createSource as createSource } from '../../../src/source';
import { MOCK_SERVER_RESPONSE_TIME, PADDING_TIME } from './constants';

describe('Hydration & Persistence', () => {
  it('Synchronous', () => {
    let mockStorage = null;
    const hydrationValue = 2;

    const sh = createSource({
      default: 1,
      lifecycle: {
        init: ({ commit }) => {
          commit(hydrationValue);
        },
        didSet: ({ state }) => {
          mockStorage = state;
        },
        didReset: () => {
          mockStorage = null;
        },
      },
    });

    // Hydration - Get value without waiting
    const hydratedValue = sh.M$get();
    expect(hydratedValue).toBe(hydrationValue);

    // Persistence
    const newPersistedValue = 3;
    sh.M$set(newPersistedValue);
    expect(mockStorage).toBe(newPersistedValue);

    // Reset
    sh.M$reset();
    expect(mockStorage).toBe(null);
  });

  it('Promise.then', () => {
    let mockStorage = null;
    const hydrationValue = 2;

    const getValueFromMockServer = () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(hydrationValue);
        }, MOCK_SERVER_RESPONSE_TIME);
      });

    const sh = createSource({
      default: 1,
      lifecycle: {
        init: ({ commit }) => {
          getValueFromMockServer().then((data) => {
            commit(data);
          });
        },
        didSet: ({ state }) => {
          mockStorage = state;
        },
        didReset: () => {
          mockStorage = null;
        },
      },
      options: {
        suspense: true,
      },
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        // Hydration - Wait for "server" to return value
        const hydratedValue = sh.M$get();
        expect(hydratedValue).toBe(hydrationValue);
        // Persistence
        const newPersistedValue = 3;
        sh.M$set(newPersistedValue);
        setTimeout(() => {
          expect(mockStorage).toBe(newPersistedValue);
          // Reset
          setTimeout(() => {
            sh.M$reset();
            expect(mockStorage).toBe(null);
            resolve();
          }, PADDING_TIME);
        }, PADDING_TIME);
      }, MOCK_SERVER_RESPONSE_TIME + PADDING_TIME);
    });
  });

  it('Asynchronous', () => {
    let mockStorage = null;
    const hydrationValue = 2;

    const getValueFromMockServer = () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(hydrationValue);
        }, MOCK_SERVER_RESPONSE_TIME);
      });

    const sh = createSource({
      default: 1,
      lifecycle: {
        init: async ({ commit }) => {
          const data = await getValueFromMockServer();
          commit(data);
        },
        didSet: ({ state }) => {
          mockStorage = state;
        },
        didReset: () => {
          mockStorage = null;
        },
      },
      options: {
        suspense: true,
      },
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        // Hydration - Wait for "server" to return value
        const hydratedValue = sh.M$get();
        expect(hydratedValue).toBe(hydrationValue);
        // Persistence
        const newPersistedValue = 3;
        sh.M$set(newPersistedValue);
        setTimeout(() => {
          expect(mockStorage).toBe(newPersistedValue);
          setTimeout(() => {
            sh.M$reset();
            expect(mockStorage).toBe(null);
            resolve();
          }, PADDING_TIME);
        }, PADDING_TIME);
      }, MOCK_SERVER_RESPONSE_TIME + PADDING_TIME);
    });
  });
});
