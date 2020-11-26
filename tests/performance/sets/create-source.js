import { createSource } from '../../../dist/umd/index.min.js';

export default {
  name: 'createSource',
  run: (i) => {
    createSource({
      key: i,
      default: { foo: 'bar' },
    });
  },
};
