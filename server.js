var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url 
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)

  if (path === '/home.html') {
    // Home page
    const cookie = request.headers.cookie
    const html = fs.readFileSync('./public/home.html').toString()
    if (cookie) {
      console.log(cookie)
      const userid = cookie.split(';').filter(item => item.includes('userid'))[0].split('=')[1]
      const userArray = JSON.parse(fs.readFileSync('./db/users.json'))
      const name = userArray.find(user => user.id === +userid).name
      const string = html.replace('Stranger', `${name}`).replace('Please sign in first', 'Back to sign in')
      response.write(string)
      response.end()
    } else {
      response.write(html)
      response.end()
    }
  } else if (path === '/signin' && method === 'POST') {
    // Sign in page
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    const arr = []
    request.on('data', (chunk) => {
      arr.push(chunk)
    })
    request.on('end', () => {
      const string = Buffer.concat(arr).toString()
      const obj = JSON.parse(string)
      const userArray = JSON.parse(fs.readFileSync('./db/users.json'))
      const userLogin = userArray.find(user => user.name === obj.name && user.password === obj.password)
      if (userLogin) {
        response.statusCode = 200
        response.setHeader('Set-Cookie', `userid=${userLogin.id}; HttpOnly`)
        response.write(`find you!`)
        response.end()
      } else {
        response.statusCode = 400
        response.setHeader('Content-Type', 'text/json;charset=utf-8')
        response.write(`{"errorCode": 4001}`)
        response.end()
      }
    })
  } else if (path === '/signup' && method === 'POST') {
    // Sign up page
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    const arr = []
    request.on('data', (chunk) => {
      arr.push(chunk)
    })
    request.on('end', () => {
      const string = Buffer.concat(arr).toString()
      const obj = JSON.parse(string)
      const userArray = JSON.parse(fs.readFileSync('./db/users.json'))
      const lastUser = userArray[userArray.length - 1]
      const nextUser = {
        id: lastUser ? lastUser.id + 1 : 1,
        name: obj.name,
        password: obj.password
      }
      console.log(nextUser)
      userArray.push(nextUser)
      fs.writeFileSync('./db/users.json', JSON.stringify(userArray))
      response.statusCode = 200
      response.write(`let's signup!`)
      response.end()
    })
  } else {
    // Common pages
    const index = path.lastIndexOf('.')
    const suffix = path.slice(index)
    const contentType = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
    }
    response.statusCode = 200
    response.setHeader('Content-Type', `${contentType[suffix] || 'text/html'};charset=utf-8`)
  
    const direc = path === '/' ? '/index.html' : path
    let content
    try {
        content = fs.readFileSync(`./public${direc}`)
    } catch (error) {
        content = 'File Not Found!'
        response.statusCode = 404
    }
    response.write(content)
    response.end()
  }

  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)