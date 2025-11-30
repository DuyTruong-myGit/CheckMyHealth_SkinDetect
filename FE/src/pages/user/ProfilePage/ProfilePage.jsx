import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext.jsx'
import { updateProfile, updateAvatar, changePassword } from '../../../services/features/profileService.js'
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
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

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

  // Kiểm tra độ mạnh mật khẩu (match với backend)
  const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return regex.test(password)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    // Kiểm tra độ mạnh mật khẩu (match với backend)
    if (!isStrongPassword(newPassword)) {
      setError('Mật khẩu quá yếu. Yêu cầu: Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setPasswordLoading(true)

    try {
      await changePassword({
        oldPassword,
        newPassword
      })
      setSuccess('Đổi mật khẩu thành công!')
      setShowPasswordChange(false)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
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

        <div className="profile-password-section" style={{ 
          marginTop: '2rem', 
          paddingTop: '2rem', 
          borderTop: '1px solid #e5e7eb' 
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Đổi mật khẩu</h2>
          
          {user.provider === 'local' ? (
            <>
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
                  <div className="profile-form-group">
                    <label htmlFor="oldPassword">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      id="oldPassword"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={passwordLoading}
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
                      minLength={8}
                    />
                    <small style={{ color: '#666666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      Yêu cầu: Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)
                    </small>
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={passwordLoading}
                      minLength={8}
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
                        setOldPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                        setError('')
                        setSuccess('')
                      }}
                      disabled={passwordLoading}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div style={{ 
              padding: '12px', 
              background: '#f3f4f6', 
              borderRadius: '6px', 
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Tài khoản đăng nhập qua Google không thể đổi mật khẩu tại đây. Vui lòng đổi mật khẩu trên tài khoản Google của bạn.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

