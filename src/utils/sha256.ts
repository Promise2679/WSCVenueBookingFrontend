export async function sha256(msg: string) {
  const msgBuffer = new TextEncoder().encode(msg)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = [...new Uint8Array(hashBuffer)]
  const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return token
}
