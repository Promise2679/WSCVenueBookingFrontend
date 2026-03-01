import CryptoJS from 'crypto-js'

export function secureHash(password: string, user_salt: string, session_salt: string) {
  const firstHash = CryptoJS.SHA256(user_salt + password)

  const sessionSaltWa = CryptoJS.enc.Utf8.parse(session_salt)

  // eslint-disable-next-line unicorn/prefer-spread
  const finalCombined = sessionSaltWa.concat(firstHash)

  const finalHash = CryptoJS.SHA256(finalCombined)

  return finalHash.toString(CryptoJS.enc.Hex)
}

export function sha256(msg: string) {
  const hash = CryptoJS.SHA256(msg)
  return hash.toString(CryptoJS.enc.Hex)
}
