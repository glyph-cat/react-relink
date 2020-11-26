export default function ({ Relink, buildEnv: { IS_DEBUG } }) {
  describe('createSource', () => {
    const key = 'test/createSource';

    it('Normal', () => {
      const Source = Relink.createSource({
        key,
        default: { username: 'foo' },
      });
      expect(Source).toStrictEqual({ key });
    });

    it('No key', () => {
      expect(() => {
        Relink.createSource({
          default: { username: 'foo' },
        });
      }).toThrow(IS_DEBUG ? /key must be a string/i : '1');
    });

    it('Duplicate key', () => {
      if (IS_DEBUG) {
        expect(() => {
          Relink.createSource({
            key,
            default: { username: 'foo' },
          });
        }).not.toThrow();
      } else {
        expect(() => {
          Relink.createSource({
            key,
            default: { username: 'foo' },
          });
        }).toThrow();
      }
    });
  });
}
