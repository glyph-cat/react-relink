- [Report a Bug](#report-a-bug)
  - [Format](#format)
  - [Example](#example)
- [Suggest Changes/Features](#suggest-changesfeatures)
  - [Format](#format-1)
  - [Example](#example-1)
- [Contributing Changes](#contributing-changes)
- [List of available commands](#list-of-available-commands)
- [Playground](#playground)

# Report a Bug

## Format

```md
# Issue description
. . .

# Steps to reproduce
. . .

# Expected results
. . .

# Actual results
. . .

# [Optional, but recommended] Reproducible Demo
(Link to reproducible demo)

# [Optional] Build involved
(Debug/CJS/ES/UMD/React Native)

# [Optional] Additional information
* . . .
```

## Example

```md
# Issue description
Components do not suspend but throws error while hydrating.

# Steps to reproduce
1. Create a source with the `lifecycle.init` method provided
2. Use any hook with the source in a component

# Expected results
Components should be suspended and be able to render a fallback UI until hydration is complete.

# Actual results
An error is thrown instead - "`y[t.key]._` is not a function".

# [Optional, but recommended] Reproducible Demo
https://codesandbox.io/path-to-demo

# [Optional] Builds involved
All production builds

# [Optional] Additional information
* This bug does not appear with `npm run debug`
```

<br/>

# Suggest Changes/Features

## Format
```md
# Issue Description
. . .

# Current Situation
. . .

# Proposed Changes
. . .

# Consideration of the changes

Pros
* . . .

Cons
* . . .
```

## Example
```md
# Issue Description
Allow subsequent hydration other than just the one in `createSource`

# Current Situation
For now, hydration is only possible one time during source creation with the `createSource` method. In a system which users can logout to switch account, hydration does not take place anymore.

A workaround would be to `useSetRelinkState`, but that will trigger the `onPersist` event. This means fetching data from the server to set a state will result in an unnecessary network request, sending the very same data back to the server when there are no actual changes.

# Proposed Changes
Expose the hydration API so that subsequent hydrations can be made. For example, consider the code below:

    function App() {
      const hydrateState = useHydrateRelinkState(Source)
      useEffect(() => {
        fetchSomeData.then((data) => {
          hydrateState(data)
        })
      })
      return '...'
    }

# Consideration of the changes

Pros
* Allows source to be hydrated without persisting the data (since it's the same data)

Cons
* There might be rare cases where hydrations are done frequently in a system and cause racing condition
```

<br/>

# Contributing Changes
Below is just an example of a generic workflow.

1. Clone the repository
2. Run `npm install` to install the necessary dependencies
3. Run `git branch -b <branch-name>` (Give `<branch-name>` a relevant name)
4. Make changes to code (new feature / bug fixing)
5. Add/Update test files relevant to the code you're working on
6. Run `npm run debug` to check if the code works
7. Run `npm run lint` to check code style and manually fix them; or `npm run lint-fix` to have the errors fixed automatically (There may still be errors that require manual fixing)
8. Run `npm run format`
9.  Run `npm run buld`
10. Run `npm test` for a complete test
11. Push the branch and create a pull request (Remember to add relevant tags to it)

<br/>

# List of available commands
These commands will be available after you run `npm install` upon first cloning the repository.

* `npm run debug` Run a test on the unbundled code only
* `npm test-bundled` Run tests on the builds for CJS, ES and UMD only
* `npm test` Run tests on the unbundled code and builds for CJS, ES and UMD
* `npm run build` Bundles the code into several builds: CJS, ES, React Native and UMD
* `npm run format` Format the code with Prettier
* `npm run lint` Checks the code style
* `npm run lint-fix` Checks the code style and automatically fixes it
* `npm run all` Equivalent of `npm run lint-fix` && `npm run format` && `npm run build` && `npm test` && `npm pack`

<br/>

# Playground
You can create temporary files such as `'index.playground.js'` or `notes.playground.md` for your own purposes like writing drafts. They will be ignored by git in case you forget to remove them at the end of your workflow.

<br/>
