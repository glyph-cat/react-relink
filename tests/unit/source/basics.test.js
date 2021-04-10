import { UNSTABLE_createSource as createSource } from '../../../src/source';

describe('Basics', () => {
  it('get', () => {
    const sh = createSource({
      default: 1,
    });
    const state = sh.M$get();
    expect(state).toBe(1);
  });

  it('set', () => {
    const sh = createSource({
      default: 1,
    });
    sh.M$set(3);
    const state = sh.M$get();
    expect(state).toBe(3);
  });
});
