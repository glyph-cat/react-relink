import { act } from 'react-test-renderer';
import { createHookInterface } from '../../__utils__/hook-interface';

export default function ({ Relink }) {
  it('Dangerously Methods', () => {
    // Create source
    const Source = Relink.createSource({
      default: 1,
    });

    const hookInterface = createHookInterface({
      hook: {
        method: Relink.useRelinkValue,
        props: [Source],
      },
      values: {
        value: (H) => H, // No longer need `[value]` because is `useRelinkValue`
      },
    });

    // Test get
    expect(Relink.dangerouslyGetRelinkValue(Source)).toBe(1);
    expect(hookInterface.get('value')).toBe('1');

    // Test set & get
    act(() => {
      Relink.dangerouslySetRelinkState(Source, 2);
    });
    expect(Relink.dangerouslyGetRelinkValue(Source)).toBe(2);
    expect(hookInterface.get('value')).toBe('2');

    // Test reset & get
    act(() => {
      Relink.dangerouslyResetRelinkState(Source);
    });
    expect(Relink.dangerouslyGetRelinkValue(Source)).toBe(1);
    expect(hookInterface.get('value')).toBe('1');

    // Test rehydrate
    act(() => {
      Relink.dangerouslyRehydrateRelinkSource(Source, ({ commit }) => {
        commit(5);
      });
    });
    expect(Relink.dangerouslyGetRelinkValue(Source)).toBe(5);
    expect(hookInterface.get('value')).toBe('5');

    hookInterface.cleanup();
  });
}
