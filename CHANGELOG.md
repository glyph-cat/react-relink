# v0.0.1
* First release

# v0.0.2
* Some corrections made to type definitions
* Added support for React Devtools — You can now inspect values returned from Relink hooks

# v0.0.3
* Fixed issue where `source.key` becomes undefined after hot module replacement
* Fixed server error "window is not defined" when using with NextJS

# 0.0.4
* Fixed TypeScript interface for `createSource`. Prior to this, `lifecycle` and `lifecycle.didReset` are optional parameters but were not defined accordingly in TypeScript.

# 0.0.5
* Fixed incorrect TypeScript definition for `useRelinkValue` and `useRelinkState` when involving selectors.

# 0.0.6
* Fixed issue where state values can still be mutated even though `options.mutable` is set to `false`.
