import { createSource } from '../../../dist/umd/index.min.js';

export default {
  name: 'createSource',
  run: () => {
    createSource({
      default: { foo: 'bar' },
    });
  },
};
