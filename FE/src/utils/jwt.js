/**
 * Decode JWT token (không verify, chỉ để lấy payload)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload hoặc null nếu lỗi
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null
    
    // JWT có format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    // Decode base64 payload
    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    
    return decoded
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

