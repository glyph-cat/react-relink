import { delay, IntegrationTestProps, TIME_GAP } from '../../helpers'

// Under rare circumstances and for reasons yet to be known, the second action
// would be executed before the first one completes, even though the `await`
// clause is used, resulting in a fatal error. This happened in v0.3.2.

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource } = Relink
  test('KIV: Edge case 01', async (): Promise<void> => {

    jest.useRealTimers()

    interface ListSourceSchema {
      list: Record<string, string>
    }

    const ListSource = createSource<ListSourceSchema>({
      key: 'list',
      default: {
        list: {},
      },
    })

    const addItemToList = async (id: string, value: string): Promise<void> => {
      await delay(TIME_GAP(1))
      ListSource.set((state) => ({
        ...state,
        list: {
          ...state.list,
          [id]: value,
        },
      }))
      await delay(TIME_GAP(1))
    }

    const modifyItemInList = (id: string): void => {
      ListSource.set((state) => ({
        ...state,
        list: {
          ...state.list,
          [id]: state.list[id].repeat(2),
        },
      }))
    }

    await addItemToList('1', 'meow')
    modifyItemInList('1')
    expect(ListSource.get().list).toStrictEqual({ '1': 'meowmeow' })

  })
}
