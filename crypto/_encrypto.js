const crypto = require('crypto')
const { cryption } = require('../config')

function encrypto(buff) {
  const cipher = crypto.createCipheriv(
    cryption.algorithm,
    cryption.key,
    cryption.iv
  )
  return cipher.update(buff)
}

module.exports = encrypto