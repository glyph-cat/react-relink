// References:
// * https://blog.logrocket.com/react-end-to-end-testing-jest-puppeteer/
// * https://github.com/smooth-code/jest-puppeteer/blob/master/packages/jest-environment-puppeteer/README.md#jest-puppeteerconfigjs

module.exports = {
  launch: {
    // headless: false,
    defaultViewport: {
      height: 900,
      width: 1200,
    },
  },
  server: {
    command: 'yarn playground:web',
    debug: true,
    launchTimeout: 5000,
    port: 3000,
  },
}