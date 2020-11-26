const TEST_SIZES = [1, 10, 100, 1000, 5000, 10000];
const TEST_SETS = [
  require('./sets/create-source'),
  // More tests (if any) go here
];

for (const { default: test } of TEST_SETS) {
  describe(test.name, () => {
    for (const testSize of TEST_SIZES) {
      it(`Size: ${testSize}`, () => {
        for (let i = 0; i < testSize; i++) {
          test.run(`${testSize}-${i}`);
        }
        expect().toBe();
      });
    }
  });
}
