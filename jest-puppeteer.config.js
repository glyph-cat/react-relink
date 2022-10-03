// Reference: https://blog.logrocket.com/react-end-to-end-testing-jest-puppeteer/

module.exports = {
  server: {
    command: 'yarn playground:web',
    debug: true,
    launchTimeout: 5000,
    port: 3000,
  },
}
