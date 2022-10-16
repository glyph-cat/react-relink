# Notes
* Unit tests are placed in the `src` folder, alongside their source code (`index.ts`).
* Most of the unit tests are in `src/internal`.
* Exposed APIs are tested as part of the integration test because it is the various builds of compiled code that are being tested.
* Do not rely on `BUILD_TYPE` in package instances because they might not be exported properly (there is even a test specifically just to make sure that they are correct), so, instead, use `buildEnv` and `buildType` provided by the wrapper because they are defined in test configs clearly.
