const net = require('net')
const Client = require('./client')

class Socks extends net.Server {
  constructor() {
    super()
    this.on('error', this.onError)
    this.on('close', this.onClose)
    this.on('connection', this.onConnection)
  }

  onError() {}
  onClose() {}
  onConnection(socket) {
    Socks.initSocket(socket)
  }

  static STATE = {
    init: 0,
    shaked: 1,
  }

  static onData(buff) {
    switch (this.state) {
      case Socks.STATE.init:
        Socks.handshake(this, buff)
        break
      case Socks.STATE.shaked:
        Socks.request(this, buff)
        break
      case Socks.STATE.requested:
        Socks.send(this, buff)
      default:
    }
  }

  static onError() {}
  static onEnd() {}
  static onClose() {}

  static initSocket(socket) {
    socket.state = Socks.STATE.init
    socket
      .on('data', Socks.onData)
      .on('error', Socks.onError)
      .on('end', Socks.onEnd)
      .on('close', Socks.onClose)
      .setNoDelay()
  }

  static handshake(socket, buff) {
    parseHandshake(socket, buff)
    socket.state = Socks.STATE.shaked
  }

  static request(socket, buff) {
    parseRequest(socket, buff)
    socket.state = Socks.STATE.requested
  }

  static createClient(socket) {
    socket._client = new Client(socket)
  }

  static send(socket, buff) {
    socket._client.send(buff)
  }
}

const RES = {
  handshake: Buffer.from([0x05, 0x00]),
  request: Buffer.from([
    0x05,
    0x00,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
  ]), // todo
}

function parseHandshake(socket, buff) {
  if (buff[0] != 0x05) {
    throw new Error('only support socks5,', 'but your version is', buff[0])
  }
  if (buff[1] != 0x01) {
    throw new Error('socks method is not support')
  }
  switch (buff[2]) {
    case 0x00:
      send(socket, RES.handshake)
      break
    case 0x01:
      break
    case 0x02:
      break
    default:
      if (0x03 <= buff[2] && buff[2] <= 0x7f) {
        throw new Error('IANA')
      } else if (0x80 <= buff[2] && buff[2] <= 0xfe) {
        throw new Error('private method')
      } else {
        throw new Error('unkown method', buff[2])
      }
  }
}

function parseRequest(socket, buff) {
  if (buff[0] != 0x05) {
    throw new Error('only support socks5,', 'but your version is', buff[0])
  }
  if (buff[2] != 0x00) {
    throw new Error('RSV != 0x00')
  }
  switch (buff[1]) {
    case 0x01:
      parseConnect(socket, buff)
      break
    case 0x02:
      break
    case 0x03:
      break
    default:
  }
}

function parseConnect(socket, buff) {
  switch (buff[3]) {
    case 0x01: // ipv4
      parseIpAndPort(socket, buff)
      break
    case 0x03:
      throw new Error('not support domain parse')
      break
    case 0x04:
      throw new Error('not support ipv6')
      break
    default:
  }
}

function parseIpAndPort(socket, buff) {
  socket._ip = buff.slice(4, 8)
  socket._port = buff.slice(8)

  send(socket, RES.request)

  Socks.createClient(socket)
}

function send(socket, buff) {
  socket.write(buff)
}

module.exports = Socks
