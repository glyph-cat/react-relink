import { createCompoundHookInterface } from '../../__utils__/hook-interface';

export default function ({ Relink }) {
  describe('useRelinkValue', () => {
    it('With selector, no extra re-renders', () => {
      const Source = Relink.createSource({
        key: 'test/useRelinkValue-sr',
        default: { a: 1, b: 2 },
      });
      const compoundHookInterface = createCompoundHookInterface({
        a: {
          hook: {
            method: Relink.useRelinkValue,
            props: [Source, ({ b }) => b],
          },
          values: {
            value: (H) => H,
          },
        },
        b: {
          hook: {
            method: Relink.useSetRelinkState,
            props: [Source],
          },
          actions: {
            step: ({ H: setState }) => {
              setState((oldState) => ({ ...oldState, a: oldState.a + 1 }));
            },
          },
        },
      });

      compoundHookInterface.at('b').actions('step');
      expect(compoundHookInterface.at('a').getRenderCount()).toBe(1);
      compoundHookInterface.cleanup();
    });
  });
}
