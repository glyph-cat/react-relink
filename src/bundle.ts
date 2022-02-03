// export * from './api/selector'
export * from './api/config'
export * from './api/scope'
export * from './api/source'
export * from './api/use-hydrate-relink-source'
export * from './api/use-relink-state'
export * from './api/use-relink-value'
export * from './api/use-reset-relink-state'
export * from './api/use-set-relink-state'
export * from './api/wait-for'
export { VERSION } from './constants'
export * from './schema'

// TODO: Find out how to transform class properties and also why the '@babel/plugin-proposal-class-properties' plugin doesn't seem to be taking effect.
// Expected bundled code to look somewhat like this:
// `var ExperimentalObj=function ExperimentalObj(){babelHelpers.classCallCheck(this,ExperimentalObj);this.sayHi=function(){console.log("hi")}}`
// Actual output:
// `exports.ExperimentalObj=class{sayHi(){console.log("hi")}}`

// /**
//  * @internal
//  */
// export class ExperimentalObj {

//   sayHi(): void {
//     // eslint-disable-next-line no-console
//     console.log('hi')
//   }

// }
