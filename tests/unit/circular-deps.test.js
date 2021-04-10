import { checkForCircularDepsAndGetKeyStack } from '../../src/circular-deps';

describe('checkForCircularDepsAndGetKeyStack', () => {
  it('with circular deps', () => {
    const callback = () => {
      const MockSourceA = {
        M$internalId: 1,
        M$deps: {},
      };
      const MockSourceB = {
        M$internalId: 2,
        M$deps: { MockSourceA },
      };
      MockSourceA.M$deps = { MockSourceB };
      checkForCircularDepsAndGetKeyStack(
        MockSourceA.M$internalId,
        MockSourceA.M$deps
      );
    };
    expect(callback).toThrow();
  });

  it('without circular deps', () => {
    const callback = () => {
      const MockSourceA = {
        M$internalId: 1,
        M$deps: {},
      };
      const MockSourceB = {
        M$internalId: 2,
        M$deps: { MockSourceA },
      };
      const MockSourceC = {
        M$internalId: 2,
        M$deps: { MockSourceB },
      };
      checkForCircularDepsAndGetKeyStack(
        MockSourceC.M$internalId,
        MockSourceC.M$deps
      );
    };
    expect(callback).not.toThrow();
  });
});
