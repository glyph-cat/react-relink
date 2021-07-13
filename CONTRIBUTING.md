# List of available commands
These commands will be available after you run `yarn install` upon first cloning the repository.

* `yarn debug` Run a test on the unbundled code only
* `yarn test:bundled` Run tests on the builds for CJS, ES and UMD only
* `yarn test` Run tests on the unbundled code and builds for CJS, ES and UMD
* `yarn build` Bundles the code into several builds: CJS, ES, React Native and UMD
* `yarn lint` Checks the code style
* `yarn lint:fix` Checks the code style and automatically fixes it
* `yarn all` Equivalent of `yarn lint:fix` && `yarn build` && `yarn test` && `yarn pack`

<br/>

# Drafts
You can create temporary files such as `'index.draft.js'` or `notes.draft.md` for your own purposes like writing drafts. They will be ignored by git in case you forget to remove them at the end of your workflow.
