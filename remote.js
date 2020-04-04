const Server = require('./server')
const { remote } = require('./config')

new Server().listen(remote.port)
