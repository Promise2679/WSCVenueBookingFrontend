export async function secureHash(password: string, user_salt: string, session_salt: string) {
  const encoder = new TextEncoder()

  const firstMsg = encoder.encode(user_salt + password)
  const firstHashBuffer = await crypto.subtle.digest('SHA-256', firstMsg)

  const sessionSaltBytes = encoder.encode(session_salt)
  const combined = new Uint8Array(sessionSaltBytes.length + 32)

  combined.set(sessionSaltBytes) // 先放入 session_salt
  combined.set(new Uint8Array(firstHashBuffer), sessionSaltBytes.length)

  const finalHashBuffer = await crypto.subtle.digest('SHA-256', combined)

  return [...new Uint8Array(finalHashBuffer)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function sha256(msg: string) {
  const msgBuffer = new TextEncoder().encode(msg)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = [...new Uint8Array(hashBuffer)]
  const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return token
}
