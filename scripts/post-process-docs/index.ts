import * as fs from 'fs'
import { name as PACKAGE_NAME } from '../../package.json'

// Example usage:
// /**
//  * @example
//  * import { example } from '{:PACKAGE_NAME:}'
//  *
//  * example()
//  */
// function example(): void {
//   return undefined
// }

const REPLACEMENTS = {
  'PACKAGE_NAME': PACKAGE_NAME,
}

const FILES_TO_PROCESS = [
  './lib/types/index.d.ts',
]

console.log('Post-processing docs...')
for (const filePath of FILES_TO_PROCESS) {
  console.log(` * ${filePath}`)
  let fileContents = fs.readFileSync(filePath, 'utf-8')
  forEachChild(REPLACEMENTS, (replacementKey, replacementValue) => {
    fileContents = fileContents.replace(
      new RegExp(`{:${replacementKey}:}`, 'g'),
      replacementValue
    )
  })
  fs.writeFileSync(filePath, fileContents, 'utf-8')
}

// ======================================================================

/**
 * Loops through each child in an object.
 * @param collection - The object to loop through.
 * @param callback - A function that receives the key and value of each item in
 * the object.
 * @example
 * const collection = {
 *   'id1': { value: 1 },
 *   'id2': { value: 2 },
 *   'id3': { value: 3 },
 *   'id4': { value: 4 },
 * }
 * const output = { concat: '', sum: 0 }
 * forEachChild(collection, (key, child, breakLoop) => {
 *   output.concat += key
 *   output.sum += child.value
 *   if (output.sum >= 6) { breakLoop() }
 * })
 * @public
 */
function forEachChild<T>(
  collection: T,
  callback: (
    /**
     * Key of the current child.
     */
    key: keyof T,
    /**
     * Value of the current child.
     */
    child: T[keyof T],
    /**
     * Invoke this function to break the loop.
     */
    breakLoop: (() => void)
  ) => void
): void {
  const keyStack = Object.keys(collection) as Array<keyof T>
  let shouldBreakLoop = false
  const breakLoop = (): void => { shouldBreakLoop = true }
  for (const key of keyStack) {
    callback(key, collection[key], breakLoop)
    if (shouldBreakLoop) { break }
  }
}
