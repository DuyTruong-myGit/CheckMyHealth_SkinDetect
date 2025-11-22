import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext.jsx'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <div>Đang tải...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Không lưu location để tránh user sau login vào trang của user trước
    // Luôn redirect về login, sau đó login sẽ tự động về home
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

