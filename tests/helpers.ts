import { ElementHandle, NodeFor, Page, WaitForSelectorOptions } from 'puppeteer'
import * as __relink__ from '../src/bundle'

export interface IntegrationTestConfig {
  buildType: 'cjs' | 'es' | 'rn' | 'umd'
  buildEnv: 'debug' | 'dev' | 'prod'
  description: string
  Relink: typeof __relink__
}

export interface E2ETestConfig {
  buildType: IntegrationTestConfig['buildType']
  buildEnv: IntegrationTestConfig['buildEnv']
  description: IntegrationTestConfig['description']
  sandboxConfig: SandboxConfig
}

export interface E2EWrapperObject extends E2ETestConfig {
  loadSandbox(
    sandboxName: string,
    pageInstance: Page
  ): Promise<ISandbox>
}

export interface SandboxConfig {
  /**
   * Build type.
   */
  t?: E2ETestConfig['buildType']
  /**
   * Is production build?
   */
  p?: boolean | 0 | 1
  screenshotSuffix?: string
}

export interface ISandbox {
  screenshot: {
    /**
     * Call this function to take a screenshots after each mocked user interaction.
     * In case assertion fails, we can know what the UI looks like at that time.
     */
    checkpoint(): Promise<void>
    snap(screenshotName: string): Promise<void>
  }
  getRenderCount(customTestId?: string): Promise<number>
  sessionStorage: {
    // NOTE: Read-only
    getItem(key: string): Promise<string>
  }
  localStorage: {
    // NOTE: Read-only
    getItem(key: string): Promise<string>
  }
  concludeTest(): Promise<void>
  waitForSelector<Selector extends string>(
    selector: Selector,
    options?: WaitForSelectorOptions
  ): Promise<ElementHandle<NodeFor<Selector>> | null>
  commonMethods: {
    getCounterValue(): Promise<number>
  }
}

export interface SampleSchema {
  foo: number,
  bar: number,
}

export interface PlayerSetSchema {
  player1: {
    nickname: string
    score: number,
  },
  player2: {
    nickname: string
    score: number,
  },
}
