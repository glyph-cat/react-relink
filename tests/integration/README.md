* Tests are written in `/bases`
* Name of test are named after the function that's being tested
* Suffixes indicate that certain aspect(s) of a function is being tested
* If a test has one or more suffixes, they are concatenated with commas (Eg: `test-s,r,d.js`)

| Suffix | Meaning             |
| ------ | ------------------- |
| `d`    | Different sources   |
| `r`    | No extra re-renders |
| `s`    | With selector       |
