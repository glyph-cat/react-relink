# List of available commands
These commands will be available after you run `npm install` upon first cloning the repository.

* `npm run debug` Run a test on the unbundled code only
* `npm test-bundled` Run tests on the builds for CJS, ES and UMD only
* `npm test` Run tests on the unbundled code and builds for CJS, ES and UMD
* `npm run build` Bundles the code into several builds: CJS, ES, React Native and UMD
* `npm run format` Format the code with Prettier
* `npm run lint` Checks the code style
* `npm run lint:fix` Checks the code style and automatically fixes it
* `npm run code` Equivalent of `npm run format` && `npm run lint:fix`
* `npm run all` Equivalent of `npm run code` && `npm run build` && `npm test` && `npm pack`

<br/>

# Drafts
You can create temporary files such as `'index.draft.js'` or `notes.draft.md` for your own purposes like writing drafts. They will be ignored by git in case you forget to remove them at the end of your workflow.
