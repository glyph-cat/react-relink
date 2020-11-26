import { act } from 'react-dom/test-utils';
import { createCompoundHookInterface } from '../../__utils__/hook-interface';

export default function ({ Relink }) {
  describe('useRehydrateRelinkSource', () => {
    it('Normal', () => {
      let didSetCalled = false;

      const Source = Relink.createSource({
        key: 'test/useRehydrateRelinkSource',
        default: 1,
        lifecycle: {
          didSet: () => {
            didSetCalled = true;
          },
        },
      });
      const compoundHookInterface = createCompoundHookInterface({
        a: {
          hook: {
            method: Relink.useRehydrateRelinkSource,
            props: [Source],
          },
          actions: {
            rehydrate: ({ H: rehydrateSource }) => {
              rehydrateSource(({ commit }) => {
                commit(5);
              });
            },
          },
        },
        b: {
          hook: {
            method: Relink.useRelinkValue,
            props: [Source],
          },
          values: {
            value: (H) => H,
          },
        },
      });

      act(() => {
        compoundHookInterface.at('a').actions('rehydrate');
      });
      expect(compoundHookInterface.at('b').get('value')).toBe('5');
      expect(didSetCalled).toBe(false);

      compoundHookInterface.cleanup();
    });
  });
}
