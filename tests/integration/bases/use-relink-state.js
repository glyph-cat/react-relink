import { createHookInterface } from '../../__utils__/hook-interface';

export default function ({ Relink }) {
  describe('useRelinkState', () => {
    it('Normal', () => {
      const Source = Relink.createSource({
        default: 1,
      });

      const hookInterface = createHookInterface({
        hook: {
          method: Relink.useRelinkState,
          props: [Source],
        },
        actions: {
          step: ({ H }) => {
            const [, setState] = H;
            setState((c) => c + 1);
          },
          replace: ({ H }) => {
            const [, setState] = H;
            setState(5);
          },
        },
        values: {
          counter: (H) => {
            const [state] = H;
            return state;
          },
        },
      });

      // Initial phase
      expect(hookInterface.get('counter')).toBe('1');

      // Update phase - callback
      hookInterface.actions('step');
      expect(hookInterface.get('counter')).toBe('2');

      // Update phase - replace value
      hookInterface.actions('replace');
      expect(hookInterface.get('counter')).toBe('5');

      hookInterface.cleanup();
    });
  });
}
