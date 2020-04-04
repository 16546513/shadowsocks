const crypto = require('crypto')
const { cryption } = require('../config')

function decrypto(buff) {
  const decipher = crypto.createDecipheriv(
    cryption.algorithm,
    cryption.key,
    cryption.iv
  )
  return decipher.update(buff)
}

module.exports = decrypto
