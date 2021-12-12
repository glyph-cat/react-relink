const pkg = require('../../package.json')
const { exec } = require('child_process')

const depStack = Object.keys(pkg.dependencies)
const devDepStack = Object.keys(pkg.devDependencies)
const allDepStack = [...depStack, ...devDepStack]

const execProcess = exec([
  `yarn remove ${allDepStack.join(' ')}`,
  `yarn add ${depStack.join(' ')}`,
  `yarn add -D ${devDepStack.join(' ')}`,
].join(' && '))

execProcess.stdout.pipe(process.stdout)
execProcess.stderr.pipe(process.stderr)

