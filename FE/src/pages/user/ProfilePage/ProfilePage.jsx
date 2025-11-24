import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext.jsx'
import { updateProfile, updateAvatar } from '../../../services/features/profileService.js'
import { requestPasswordReset, resetPasswordWithCode } from '../../../services/auth/authService.js'
import { usePageTitle } from '../../../hooks/usePageTitle.js'
import './Profile.css'

const ProfilePage = () => {
  usePageTitle('Hồ sơ')
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  
  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordCode, setPasswordCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await updateProfile({ fullName: formData.fullName })
      updateUser({ fullName: formData.fullName })
      setSuccess('Cập nhật hồ sơ thành công!')
    } catch (err) {
      setError(err.message || 'Không thể cập nhật hồ sơ')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setSuccess('')
    setAvatarUploading(true)

    try {
      const result = await updateAvatar(file)
      if (result?.avatar_url) {
        updateUser({ avatar_url: result.avatar_url })
        setSuccess('Cập nhật ảnh đại diện thành công!')
      } else {
        setSuccess('Đã cập nhật ảnh đại diện.')
      }
    } catch (err) {
      setError(err.message || 'Không thể cập nhật ảnh đại diện')
    } finally {
      setAvatarUploading(false)
      // reset input để có thể chọn lại cùng một file nếu cần
      e.target.value = ''
    }
  }

  const handleRequestPasswordCode = async () => {
    setError('')
    setSuccess('')
    setPasswordLoading(true)

    try {
      await requestPasswordReset()
      setCodeSent(true)
      setSuccess('Mã xác nhận đã được gửi đến email của bạn!')
    } catch (err) {
      setError(err.message || 'Không thể gửi mã xác nhận')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!passwordCode || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (passwordCode.length !== 6) {
      setError('Mã xác nhận phải có 6 số')
      return
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setPasswordLoading(true)

    try {
      await resetPasswordWithCode({
        code: passwordCode,
        newPassword
      })
      setSuccess('Đổi mật khẩu thành công!')
      setShowPasswordChange(false)
      setPasswordCode('')
      setNewPassword('')
      setConfirmPassword('')
      setCodeSent(false)
    } catch (err) {
      setError(err.message || 'Đổi mật khẩu thất bại')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Đang tải thông tin...</p>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">Hồ sơ của tôi</h1>

        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            <img
              src={user.avatar_url || '/avatar_default.svg'}
              alt="Avatar"
              className="profile-avatar-image"
              onError={(e) => {
                // Nếu ảnh lỗi (kể cả default), fallback về default
                if (e.target.src !== '/avatar_default.svg') {
                  e.target.src = '/avatar_default.svg'
                }
              }}
            />
          </div>
          <label className="profile-avatar-upload">
            <span>{avatarUploading ? 'Đang tải ảnh...' : 'Đổi ảnh đại diện'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={avatarUploading}
            />
          </label>
        </div>

        {error && (
          <div className="profile-error">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              disabled
              className="profile-input-disabled"
            />
            <small className="profile-hint">Email không thể thay đổi</small>
          </div>

          <div className="profile-form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              required
              disabled={loading}
            />
          </div>

          <div className="profile-form-group">
            <label>Phương thức đăng nhập</label>
            <input
              type="text"
              value={user.provider === 'local' ? 'Email/Password' : 'Google'}
              disabled
              className="profile-input-disabled"
            />
          </div>

          <button 
            type="submit" 
            className="profile-button"
            disabled={loading}
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
          </button>
        </form>

        {user.provider === 'local' && (
          <div className="profile-password-section" style={{ 
            marginTop: '2rem', 
            paddingTop: '2rem', 
            borderTop: '1px solid #e5e7eb' 
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Đổi mật khẩu</h2>
            
            {!showPasswordChange ? (
              <button
                type="button"
                className="profile-button"
                style={{ background: '#6b7280' }}
                onClick={() => setShowPasswordChange(true)}
              >
                Đổi mật khẩu
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="profile-form">
                {!codeSent ? (
                  <>
                    <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                      Nhấn nút bên dưới để nhận mã xác nhận qua email
                    </p>
                    <button
                      type="button"
                      className="profile-button"
                      onClick={handleRequestPasswordCode}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="profile-form-group">
                      <label htmlFor="passwordCode">Mã xác nhận (6 số)</label>
                      <input
                        type="text"
                        id="passwordCode"
                        value={passwordCode}
                        onChange={(e) => setPasswordCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        required
                        disabled={passwordLoading}
                        style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '18px' }}
                      />
                    </div>

                    <div className="profile-form-group">
                      <label htmlFor="newPassword">Mật khẩu mới</label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={passwordLoading}
                        minLength={6}
                      />
                    </div>

                    <div className="profile-form-group">
                      <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={passwordLoading}
                        minLength={6}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="submit"
                        className="profile-button"
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                      </button>
                      <button
                        type="button"
                        className="profile-button"
                        style={{ background: '#6b7280' }}
                        onClick={() => {
                          setShowPasswordChange(false)
                          setPasswordCode('')
                          setNewPassword('')
                          setConfirmPassword('')
                          setCodeSent(false)
                          setError('')
                          setSuccess('')
                        }}
                        disabled={passwordLoading}
                      >
                        Hủy
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage

