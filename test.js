const fs = require('fs')

const userString = fs.readFileSync('./db/users.json')
const userArray = JSON.parse(userString)
console.log(userArray)

const nextUser = {id: 3, name: 'cecilia', password: 'mermaid'}
userArray.push(nextUser)
fs.writeFileSync('./db/users.json', JSON.stringify(userArray))