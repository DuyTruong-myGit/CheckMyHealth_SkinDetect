import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getHistory } from '../services/diagnosisService.js'
import './History.css'

const HistoryPage = () => {
  const { isAuthenticated } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory()
    }
  }, [isAuthenticated])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getHistory()
      setHistory(data)
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử chẩn đoán')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="history-container">
        <div className="history-card">
          <h2>Yêu cầu đăng nhập</h2>
          <p>Bạn cần đăng nhập để xem lịch sử chẩn đoán.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history-container">
      <div className="history-card">
        <h1 className="history-title">Lịch sử chẩn đoán</h1>
        <p className="history-subtitle">Xem lại các lần chẩn đoán trước đây của bạn</p>

        {error && (
          <div className="history-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="history-loading">
            <p>Đang tải...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="history-empty">
            <p>Bạn chưa có lịch sử chẩn đoán nào.</p>
            <p>Hãy thử chẩn đoán ảnh đầu tiên của bạn!</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item.diagnosis_id} className="history-item">
                <div className="history-item-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt="Diagnosis" />
                  ) : (
                    <div className="history-item-placeholder">Không có ảnh</div>
                  )}
                </div>
                <div className="history-item-content">
                  <div className="history-item-header">
                    <h3>{item.disease_name || 'Không xác định'}</h3>
                    <span className="history-item-date">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  <div className="history-item-meta">
                    <span className="history-item-confidence">
                      Độ tin cậy: {item.confidence_score 
                        ? `${(item.confidence_score * 100).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  {item.result_json?.description && (
                    <p className="history-item-description">
                      {item.result_json.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage

