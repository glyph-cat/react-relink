module.exports = {
  env: {
    test: {
      presets: ['@babel/preset-react'],
      plugins: [
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-transform-modules-commonjs',
      ],
    },
  },
  // Moved out of `env/test` to support linting
  plugins: [
    ['@babel/plugin-transform-react-jsx', { pragma: 'React.createElement' }],
  ],
};
