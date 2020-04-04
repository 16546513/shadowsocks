const Socks = require('./socks')
const { local } = require('./config')

new Socks().listen(local.port)
