const net = require('net')
const Encrypto = require('./crypto/encrypto')
const Decrypto = require('./crypto/decrypto')
const { remote: Remote } = require('./config')

class Client {
  constructor(socket) {
    this.local = socket
    this.connectRemote(socket)
    this.sendIpAndPort()
  }

  sendIpAndPort() {
    const { _ip: ip, _port: port } = this.local
    this.remote.write(ip)
    this.remote.write(port)
  }

  connectRemote(local) {
    const remote = net.connect(Remote.port, Remote.ip)
    Client.initRemote(remote, local)
    this.remote = remote
  }

  static onClose() {}
  static onError() {}
  static onEnd() {}
  static onData(buff) {
    if (!this._decrypto) {
      this._decrypto = new Decrypto(this._local)
    }
    this._decrypto.send(buff)
  }

  static initRemote(remote, local) {
    remote._local = local
    local._remote = remote
    remote
      .on('close', Client.onClose)
      .on('error', Client.onError)
      .on('data', Client.onData)
      .on('end', Client.onEnd)
      .setNoDelay()
  }

  send(buff) {
    if (!this._encrypto) {
      this._encrypto = new Encrypto(this.remote)
    }
    this._encrypto.send(buff)
  }
}

module.exports = Client
