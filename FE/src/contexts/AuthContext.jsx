/* @refresh reset */
import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginService, logout as logoutService, register as registerService, isAuthenticated, getToken } from '../services/auth/authService.js'
import { getProfile } from '../services/features/profileService.js'
import { decodeToken } from '../utils/jwt.js'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Lấy role từ token
  const getRoleFromToken = () => {
    const token = getToken()
    if (!token) return null
    const decoded = decodeToken(token)
    return decoded?.role || null
  }

  // Kiểm tra xem user đã đăng nhập chưa khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          // Có token, lấy thông tin user
          const profile = await getProfile()
          
          // Kiểm tra account status - nếu bị ban/suspended thì logout
          if (profile.account_status === 'suspended' || profile.account_status === 'banned') {
            logoutService()
            setUser(null)
            setError('Tài khoản của bạn đang bị đình chỉ. Vui lòng liên hệ quản trị viên.')
            setLoading(false)
            return
          }
          
          // Lấy role từ token vì profile API không trả về role
          const role = getRoleFromToken()
          setUser({ ...profile, role })
        }
      } catch (err) {
        // Kiểm tra nếu là lỗi 403 (account bị ban)
        if (err.message && (err.message.includes('đình chỉ') || err.message.includes('bị tạm khóa') || err.message.includes('bị khóa'))) {
          logoutService()
          setUser(null)
          setError(err.message)
        } else {
          // Token không hợp lệ hoặc đã hết hạn
          logoutService()
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Lắng nghe event khi account bị ban từ apiClient
  useEffect(() => {
    const handleAccountBanned = (event) => {
      const { message } = event.detail
      logoutService()
      setUser(null)
      setError(message || 'Tài khoản của bạn đang bị đình chỉ. Vui lòng liên hệ quản trị viên.')
    }

    window.addEventListener('account-banned', handleAccountBanned)
    return () => {
      window.removeEventListener('account-banned', handleAccountBanned)
    }
  }, [])

  const login = async (credentials) => {
    try {
      setError(null)
      const response = await loginService(credentials)
      // Lấy thông tin user sau khi đăng nhập thành công
      // Sử dụng user từ response nếu có, nếu không thì gọi getProfile
      if (response.user) {
        setUser(response.user)
      } else {
        const profile = await getProfile()
        
        // Kiểm tra account status sau khi getProfile
        if (profile.account_status === 'suspended' || profile.account_status === 'banned') {
          logoutService()
          setUser(null)
          throw new Error('Tài khoản của bạn đang bị đình chỉ. Vui lòng liên hệ quản trị viên.')
        }
        
        const role = getRoleFromToken()
        setUser({ ...profile, role })
      }
      return response
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const response = await registerService(userData)
      // Sau khi đăng ký thành công, tự động đăng nhập
      if (response.userId) {
        await login({ email: userData.email, password: userData.password })
      }
      return response
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const logout = () => {
    logoutService()
    setUser(null)
    setError(null)
  }

  const updateUser = (userData) => {
    setUser(prev => {
      if (prev) {
        return { ...prev, ...userData }
      }
      return userData
    })
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    setError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

