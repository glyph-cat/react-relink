/* eslint-disable import/no-unresolved, @typescript-eslint/ban-ts-comment */
import { useSearchParams } from 'react-router-dom'
import type { IntegrationTestConfig } from '../../../../tests/helpers'
import { createSuspenseWaiter } from '../../../../src/internals/suspense-waiter'
// @ts-ignore
import * as Relink_Types from '../../../../lib/types'

type RelinkPackage = typeof Relink_Types

let Relink_DEBUG: RelinkPackage
let Relink_DEBUG_promise: Promise<void>

let Relink_CJS: RelinkPackage
let Relink_CJS_promise: Promise<void>

let Relink_ES: RelinkPackage
let Relink_ES_promise: Promise<void>

let Relink_MJS: RelinkPackage
let Relink_MJS_promise: Promise<void>

let Relink_RN: RelinkPackage
let Relink_RN_promise: Promise<void>

let Relink_UMD: RelinkPackage
let Relink_UMD_promise: Promise<void>

let Relink_UMD_MIN: RelinkPackage
let Relink_UMD_MIN_promise: Promise<void>

export function useRelinkPackage(): RelinkPackage {
  const [searchParams] = useSearchParams()
  const buildType = searchParams.get('t') as IntegrationTestConfig['buildType']
  const isProdEnv = Boolean(searchParams.get('p'))
  if (!buildType) {
    if (!Relink_DEBUG_promise) {
      Relink_DEBUG_promise = (async () => {
        Relink_DEBUG = await import('../../../../src/bundle')
      })()
      createSuspenseWaiter(Relink_DEBUG_promise)()
    }
    return Relink_DEBUG
  } else {
    switch (buildType) {
      case 'cjs': {
        if (!Relink_CJS_promise) {
          Relink_CJS_promise = (async () => {
            Relink_CJS = await import('../../../../lib/cjs/index.js')
          })()
          createSuspenseWaiter(Relink_CJS_promise)()
        }
        return Relink_CJS
      }
      case 'es': {
        if (isProdEnv) {
          if (!Relink_MJS_promise) {
            Relink_MJS_promise = (async () => {
              Relink_MJS = await import('../../../../lib/es/index.mjs')
            })()
            createSuspenseWaiter(Relink_MJS_promise)()
          }
          return Relink_MJS
        } else {
          if (!Relink_ES_promise) {
            Relink_ES_promise = (async () => {
              Relink_ES = await import('../../../../lib/es/index.js')
            })()
            createSuspenseWaiter(Relink_ES_promise)()
          }
          return Relink_ES
        }
      }
      case 'rn': {
        if (!Relink_RN_promise) {
          Relink_RN_promise = (async () => {
            Relink_RN = await import('../../../../lib/native/index.js')
          })()
          createSuspenseWaiter(Relink_RN_promise)()
        }
        return Relink_RN
      }
      case 'umd': {
        if (isProdEnv) {
          if (!Relink_UMD_MIN_promise) {
            Relink_UMD_MIN_promise = (async () => {
              Relink_UMD_MIN = await import('../../../../lib/umd/index.min.js')
            })()
            createSuspenseWaiter(Relink_UMD_MIN_promise)()
          }
          return Relink_UMD_MIN
        } else {
          if (!Relink_UMD_promise) {
            Relink_UMD_promise = (async () => {
              Relink_UMD = await import('../../../../lib/umd/index.js')
            })()
            createSuspenseWaiter(Relink_UMD_promise)()
          }
          return Relink_UMD
        }
      }
      default: {
        throw new Error(`Invalid buildType '${buildType}'`)
      }
    }
  }
}
