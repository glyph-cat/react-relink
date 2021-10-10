import { createCleanupRef, createHookInterface } from '@chin98edwin/react-test-utils'
import { act } from 'react-test-renderer'
import { RelinkSource } from '../../../src/schema'
import { IntegrationTestConfig, PlayerSetSchema } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, createSelector, useRelinkValue } = Relink

  let Source: RelinkSource<PlayerSetSchema>
  const cleanupRef = createCleanupRef()
  afterEach((): void => {
    Source.cleanup()
    cleanupRef.run()
  })

  describe('Mmutable', (): void => {

    test('Without selector', async (): Promise<void> => {

      Source = createSource<PlayerSetSchema>({
        key: 'test/no-extra-render/mutable/without-selector',
        default: {
          player1: {
            nickname: 'foo',
            score: 0,
          },
          player2: {
            nickname: 'bar',
            score: 0,
          },
        },
        options: {
          mutable: true,
        },
      })

      const hookInterface = createHookInterface({
        useHook: () => useRelinkValue(Source),
      }, cleanupRef)
      expect(hookInterface.getRenderCount()).toBe(1)

      await act(async (): Promise<void> => {
        Source.set(state => state)
      })
      expect(hookInterface.getRenderCount()).toBe(1)

      await act(async (): Promise<void> => {
        Source.set(state => ({ ...state }))
      })
      expect(hookInterface.getRenderCount()).toBe(2)

      await act(async (): Promise<void> => {
        Source.set(state => ({
          ...state,
          player2: {
            ...state.player2,
            score: state.player2.score + 1,
          },
        }))
      })
      expect(hookInterface.getRenderCount()).toBe(3)

    })

    describe('With selector', (): void => {

      test('Legacy selector', async (): Promise<void> => {

        Source = createSource<PlayerSetSchema>({
          key: 'test/no-extra-render/mutable/with-selector/legacy',
          default: {
            player1: {
              nickname: 'foo',
              score: 0,
            },
            player2: {
              nickname: 'bar',
              score: 0,
            },
          },
          options: {
            mutable: true,
          },
        })

        const hookInterface = createHookInterface({
          useHook: () => useRelinkValue(Source, s => s.player1),
        }, cleanupRef)
        expect(hookInterface.getRenderCount()).toBe(1)

        await act(async (): Promise<void> => {
          Source.set(state => state)
        })
        expect(hookInterface.getRenderCount()).toBe(1)

        await act(async (): Promise<void> => {
          Source.set(state => ({ ...state }))
        })
        expect(hookInterface.getRenderCount()).toBe(2)

        await act(async (): Promise<void> => {
          Source.set(state => ({
            ...state,
            player2: {
              ...state.player2,
              score: state.player2.score + 1,
            },
          }))
        })
        expect(hookInterface.getRenderCount()).toBe(3)

      })

      describe('Modern Selector', (): void => {

        test('checkBeforeSelect=false', async (): Promise<void> => {

          Source = createSource<PlayerSetSchema>({
            key: 'test/no-extra-render/mutable/with-selector/modern/cbs-f',
            default: {
              player1: {
                nickname: 'foo',
                score: 0,
              },
              player2: {
                nickname: 'bar',
                score: 0,
              },
            },
            options: {
              mutable: true,
            },
          })

          const Player1Selector = createSelector({
            get(s: PlayerSetSchema) { return s.player1 },
            checkBeforeSelect: false,
          })

          const hookInterface = createHookInterface({
            useHook: () => useRelinkValue(Source, Player1Selector),
          }, cleanupRef)
          expect(hookInterface.getRenderCount()).toBe(1)

          await act(async (): Promise<void> => {
            Source.set(state => state)
          })
          expect(hookInterface.getRenderCount()).toBe(1)

          await act(async (): Promise<void> => {
            Source.set(state => ({ ...state }))
          })
          expect(hookInterface.getRenderCount()).toBe(2)

          await act(async (): Promise<void> => {
            Source.set(state => ({
              ...state,
              player2: {
                ...state.player2,
                score: state.player2.score + 1,
              },
            }))
          })
          expect(hookInterface.getRenderCount()).toBe(3)

        })

        test('checkBeforeSelect=true', async (): Promise<void> => {

          Source = createSource<PlayerSetSchema>({
            key: 'test/no-extra-render/mutable/with-selector/modern/cbs-f',
            default: {
              player1: {
                nickname: 'foo',
                score: 0,
              },
              player2: {
                nickname: 'bar',
                score: 0,
              },
            },
            options: {
              mutable: true,
            },
          })

          const Player1Selector = createSelector({
            get(s: PlayerSetSchema) { return s.player1 },
            checkBeforeSelect: false,
          })

          const hookInterface = createHookInterface({
            useHook: () => useRelinkValue(Source, Player1Selector),
          }, cleanupRef)
          expect(hookInterface.getRenderCount()).toBe(1)

          await act(async (): Promise<void> => {
            Source.set(state => state)
          })
          expect(hookInterface.getRenderCount()).toBe(1)

          await act(async (): Promise<void> => {
            Source.set(state => ({ ...state }))
          })
          expect(hookInterface.getRenderCount()).toBe(1)

          await act(async (): Promise<void> => {
            Source.set(state => ({
              ...state,
              player2: {
                ...state.player2,
                score: state.player2.score + 1,
              },
            }))
          })
          expect(hookInterface.getRenderCount()).toBe(1)

        })

      })

    })

  })

  describe('Immutable', (): void => {

    test('Without selector', async (): Promise<void> => {

      Source = createSource<PlayerSetSchema>({
        key: 'test/no-extra-render/immutable/without-selector',
        default: {
          player1: {
            nickname: 'foo',
            score: 0,
          },
          player2: {
            nickname: 'bar',
            score: 0,
          },
        },
        options: {
          mutable: false,
        },
      })

      const hookInterface = createHookInterface({
        useHook: () => useRelinkValue(Source),
      }, cleanupRef)
      expect(hookInterface.getRenderCount()).toBe(1)

      await act(async (): Promise<void> => {
        Source.set(state => state)
      })
      expect(hookInterface.getRenderCount()).toBe(1)

      await act(async (): Promise<void> => {
        Source.set(state => ({ ...state }))
      })
      expect(hookInterface.getRenderCount()).toBe(1)

      await act(async (): Promise<void> => {
        Source.set(state => ({
          ...state,
          player2: {
            ...state.player2,
            score: state.player2.score + 1,
          },
        }))
      })
      expect(hookInterface.getRenderCount()).toBe(2)

    })

    test('With selector', async (): Promise<void> => {

      Source = createSource<PlayerSetSchema>({
        key: 'test/no-extra-render/immutable/with-selector',
        default: {
          player1: {
            nickname: 'foo',
            score: 0,
          },
          player2: {
            nickname: 'bar',
            score: 0,
          },
        },
        options: {
          mutable: false,
        },
      })

      const hookInterface = createHookInterface({
        useHook: () => useRelinkValue(Source, s => s.player1),
      }, cleanupRef)
      expect(hookInterface.getRenderCount()).toBe(1)

      await act(async (): Promise<void> => {
        Source.set(state => state)
      })
      expect(hookInterface.getRenderCount()).toBe(1)

      await act(async (): Promise<void> => {
        Source.set(state => ({ ...state }))
      })
      expect(hookInterface.getRenderCount()).toBe(1)

      await act(async (): Promise<void> => {
        Source.set(state => ({
          ...state,
          player2: {
            ...state.player2,
            score: state.player2.score + 1,
          },
        }))
      })
      expect(hookInterface.getRenderCount()).toBe(1)

    })

  })

})
