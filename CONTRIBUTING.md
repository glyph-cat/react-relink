# List of available commands
These commands will be available after you run `yarn install` upon first cloning the repository.

## Commonly Used
* `yarn clean` Remove (automatically-generated) temporary files. This does not include `.draft` files and folders.
* `yarn lint` Checks code for problems.
* `yarn debug` Run a test on the unbundled code only.
* `yarn test` Run tests both unbundled and bundled code.
* `yarn build` Equivalent of `yarn rollup` && `yarn types` && `yarn api`.
* `yarn all` Equivalent of `yarn clean` && `yarn lint:fix` && `yarn build` && `yarn test` && `yarn pack`.

<br/>

## Other Commands
* `yarn lint:fix` Checks code for problems and automatically apply fixes where possible.
* `yarn test:bundled` Run tests on the bundled builds.
* `yarn rollup` Bundles the code into several builds: CJS, ES, UMD.
* `yarn types` Generate type declarations in the `temp` folder.
* `yarn api` Bundle type declarations from `yarn types` into one file.

<br/>

# Drafts
You can create temporary files such as `'index.draft.js'` or `notes.draft.md` for your own purposes like writing drafts. They will be ignored by git in case you forget to remove them at the end of your workflow.
