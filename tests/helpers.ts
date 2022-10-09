import { ElementHandle, NodeFor, WaitForSelectorOptions } from 'puppeteer'
import * as __relink__ from '../src/bundle'

export interface UnitTestConfig {
  buildType: 'cjs' | 'es' | 'rn' | 'umd'
  buildEnv: 'debug' | 'dev' | 'prod'
  description: string
  Relink: typeof __relink__
}

export interface IntegrationTestConfig {
  buildType: UnitTestConfig['buildType']
  buildEnv: UnitTestConfig['buildEnv']
  description: UnitTestConfig['description']
  sandboxConfig: SandboxConfig
}

export interface WrapperObject extends IntegrationTestConfig {
  loadSandbox(sandboxName: string): Promise<ISandbox>
}

export interface SandboxConfig {
  /**
   * Build type.
   */
  t?: IntegrationTestConfig['buildType']
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
