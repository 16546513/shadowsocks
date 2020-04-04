const encrypto = require('./_encrypto')

const MAX = 0xffff

class Encrypto {
  constructor(remote) {
    this.remote = remote
  }
  send(buff) {
    this.eat(buff)
  }
  eat(buff) {
    if (!buff.length) {
      return
    }
    this.write(encrypto(buff.slice(0, MAX)))
    this.eat(buff.slice(MAX))
  }
  write(buff) {
    const head = Buffer.allocUnsafe(2)
    head.writeUInt16BE(buff.length, 0)
    const data = Buffer.concat([head, buff], 2 + buff.length)
    this.remote.write(data)
  }
}

module.exports = Encrypto
