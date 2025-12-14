import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../../hooks/usePageTitle.js'
import { publicForgotPassword } from '../../../services/auth/authService.js'
import '../Auth.css'

const ForgotPasswordPage = () => {
  usePageTitle('Quên mật khẩu')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await publicForgotPassword(email)
      setSuccess(response.message || 'Nếu email này tồn tại, chúng tôi đã gửi một mã xác nhận.')
      // Redirect đến trang reset password sau 2 giây
      setTimeout(() => {
        navigate('/reset-password', { state: { email } })
      }, 2000)
    } catch (err) {
      setError(err.message || 'Không thể gửi mã xác nhận')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Quên mật khẩu</h1>
        <p className="auth-subtitle">
          Nhập email của bạn để nhận mã xác nhận đặt lại mật khẩu
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success" style={{ 
            background: '#d1fae5', 
            color: '#065f46', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            marginBottom: '16px' 
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading || !!success}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || !!success}
          >
            {loading ? 'Đang gửi...' : success ? 'Đã gửi mã' : 'Gửi mã xác nhận'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Nhớ mật khẩu?{' '}
            <Link to="/login" className="auth-link">
              Đăng nhập
            </Link>
          </p>
          <p style={{ marginTop: '8px' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="auth-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage

