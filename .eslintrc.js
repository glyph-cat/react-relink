module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2020: true,
  },
  globals: {
    window: 'readonly',
    process: 'readonly',
  },
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-irregular-whitespace': [
      'error',
      {
        skipStrings: true,
        skipComments: true,
        skipRegExps: true,
        skipTemplates: true,
      },
    ],
  },
};
