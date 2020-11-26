import { createHookInterface } from '../../__utils__/hook-interface';

export default function ({ Relink }) {
  describe('useRelinkValue', () => {
    it('Normal', () => {
      const Source = Relink.createSource({
        key: 'test/useRelinkValue',
        default: 1,
      });
      const hookInterface = createHookInterface({
        hook: {
          method: Relink.useRelinkValue,
          props: [Source],
        },
        values: {
          value: (H) => H,
        },
      });
      expect(hookInterface.get('value')).toBe('1');
      hookInterface.cleanup();
    });
  });
}
