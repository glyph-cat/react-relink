import { RelinkSourceKey } from '../../schema'

const rgbCache: Record<RelinkSourceKey, string> = {}

// Purposely ordered this way to create contrast
const PRESET_COLORS = [
  '#BB8888',
  '#88BB88',
  '#CCAA88',
  '#88AACC',
  '#DD88DD',
  '#DDDD88',
  '#BB66BB',
]

// TODO: Colors won't be consistent across tests and will make it hard to
// find recognize keys. Temporarily solved with `PRESET_COLORS`.
// Can refer to this https://stackoverflow.com/a/3887274/5810737

export function getHexFromString(value: RelinkSourceKey): string {
  if (rgbCache[value]) {
    return rgbCache[value]
  } else {
    if (PRESET_COLORS.length > 0) {
      const newColor = PRESET_COLORS.shift()
      rgbCache[value] = newColor
      return newColor
    } else {
      const chars = '789ABCD'
      let newColor = '#'
      for (let i = 0; i < 6; i++) {
        newColor += chars[Math.floor(Math.random() * chars.length)]
      }
      rgbCache[value] = newColor
      return newColor
    }
  }
}
