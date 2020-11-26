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
  plugins: [
    ['@babel/plugin-transform-react-jsx', { pragma: 'React.createElement' }],
  ],
};
