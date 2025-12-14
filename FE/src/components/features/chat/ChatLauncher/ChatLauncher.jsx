import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../../contexts/AuthContext.jsx'

const ChatLauncher = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    navigate('/chat')
  }

  return (
    <div 
      className="chat-launcher-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        className="chat-launcher" 
        onClick={handleClick} 
        aria-label="Mở chat AI"
      >
        <div className="chat-launcher__icon">
          <span>AI</span>
        </div>
      </button>
      {isHovered && (
        <div className="chat-launcher__tooltip">
          <div className="chat-launcher__tooltip-content">
            <span>Hỗ trợ AI</span>
            <strong>Chat ngay</strong>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatLauncher

