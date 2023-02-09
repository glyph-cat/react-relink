import * as fs from 'fs'

// What this script does:
// Updates the year in the `LICENSE` file.

const licenseFilePath = './LICENSE'
let licenseText = fs.readFileSync(licenseFilePath, 'utf-8')

const currentYear = new Date().getFullYear()
licenseText = licenseText.replace(/\d{4} - \d{4}/, `2020 - ${currentYear}`)

fs.writeFileSync(licenseFilePath, licenseText, 'utf-8')
