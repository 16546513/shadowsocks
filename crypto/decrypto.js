const decrypto = require('./_decrypto')

class Decrypto {
  static STATE = {
    unknownLength: 0,
    knowLength: 1,
  }

  constructor(local) {
    this.local = local

    this.clean()
  }

  send(buff) {
    switch (this.state) {
      case Decrypto.STATE.unknownLength:
        this.parseLength(buff)
        break
      case Decrypto.STATE.knowLength:
        this.eat(buff)
        break
      default:
    }
  }

  eat(buff) {
    let { cache, length } = this
    const total = buff.length + cache.length
    if (total < length) {
      return (this.cache = Buffer.concat([cache, buff], total))
    }
    const restLenght = length - cache.length
    cache = Buffer.concat([cache, buff], length)
    this.write(cache)

    this.send(buff.slice(restLenght))
  }

  write(buff) {
    this.local.write(decrypto(buff))

    this.clean()
  }

  clean() {
    this.cache = Buffer.alloc(0)
    this.state = Decrypto.STATE.unknownLength
    this.length = 0
    this.tempLength = []
  }

  parseLength(buff) {
    for (let i = 0; i < buff.length; i++) {
      this.tempLength.push(buff[i])

      if (this.tempLength.length == 2) {
        this.ensureLength()
        return this.send(buff.slice(i + 1))
      }
    }
  }

  ensureLength() {
    this.length = Buffer.from(this.tempLength).readUInt16BE()
    this.state = Decrypto.STATE.knowLength
  }
}

module.exports = Decrypto
