// References:
// * https://blog.logrocket.com/react-end-to-end-testing-jest-puppeteer
// * https://github.com/smooth-code/jest-puppeteer/blob/master/packages/jest-environment-puppeteer/README.md#jest-puppeteerconfigjs

module.exports = {
  /**
   * @type import('puppeteer').PuppeteerLaunchOptions
   */
  launch: {
    // headless: false,
    // slowMo: 10,
    defaultViewport: {
      height: 900,
      width: 1200,
    },
  },
  /**
   * @type import('jest-dev-server').JestDevServerOptions
   */
  server: {
    command: 'yarn playground:web:test',
    // debug: true,
    launchTimeout: 5000,
    port: 3031,
  },
}
