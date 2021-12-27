module.exports = {
  env: {
    test: {
      presets: [
        '@babel/preset-typescript',
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
      ],
    },
  },
}
