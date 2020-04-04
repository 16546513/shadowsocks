const net = require('net')
const Encrypto = require('./crypto/encrypto')
const Decrypto = require('./crypto/decrypto')

class Server extends net.Server {
  constructor() {
    super()
    this.on('close', this.onClose)
    this.on('connection', this.onConnection)
    this.on('error', this.onError)
  }

  onClose() {}
  onError() {}
  onConnection(socket) {
    Server.initSocket(socket)
  }

  static STATE = {
    noIpAndPort: 0,
    hasIpAndPort: 1,
  }

  static onError() {}
  static onEnd() {}
  static onClose() {}
  static onData(buff) {
    switch (this.state) {
      case Server.STATE.noIpAndPort:
        parseIpAndPort(this, buff)
        break
      case Server.STATE.hasIpAndPort:
        send(this, buff)
    }
  }

  static initSocket(socket) {
    socket.state = Server.STATE.noIpAndPort
    socket._tempIpAndPort = []
    socket
      .on('data', Server.onData)
      .on('error', Server.onError)
      .on('end', Server.onEnd)
      .on('close', Server.onClose)
      .setNoDelay()
  }

  static createLocal(remote) {
    const local = net.connect(remote._port, remote._ip)
    Server.initLocal(remote, local)
  }

  static onClose1() {}
  static onError1() {}
  static onEnd1() {}
  static onData1(buff) {
    if (!this._encrypto) {
      this._encrypto = new Encrypto(this._remote)
    }
    this._encrypto.send(buff)
  }

  static initLocal(remote, local) {
    remote._local = local
    local._remote = remote
    local
      .on('close', Server.onClose1)
      .on('error', Server.onError1)
      .on('data', Server.onData1)
      .on('end', Server.onEnd1)
      .setNoDelay()
  }
}

function parseIpAndPort(socket, buff) {
  for (let i = 0; i < buff.length; i++) {
    socket._tempIpAndPort.push(buff[i])

    if (socket._tempIpAndPort.length == 6) {
      ensureIpAndPort(socket)
      return socket.emit('data', buff.slice(i + 1))
    }
  }
}

function ensureIpAndPort(socket) {
  socket._ip = socket._tempIpAndPort.slice(0, 4).join('.')
  socket._port = Buffer.from(socket._tempIpAndPort.slice(4)).readUInt16BE()
  socket._tempIpAndPort = undefined
  socket.state = Server.STATE.hasIpAndPort

  Server.createLocal(socket)
}

function send(remote, buff) {
  if (!remote._decrypto) {
    remote._decrypto = new Decrypto(remote._local)
  }
  remote._decrypto.send(buff)
}

module.exports = Server
