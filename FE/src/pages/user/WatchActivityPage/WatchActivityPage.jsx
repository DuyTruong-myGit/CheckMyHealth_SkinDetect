import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext.jsx'
import { usePageTitle } from '../../../hooks/usePageTitle.js'
import { getWatchMeasurements, getWatchStats } from '../../../services/features/watchService.js'

const WatchActivityPage = () => {
  usePageTitle('Lịch sử hoạt động đồng hồ')
  const { isAuthenticated } = useAuth()

  const [measurements, setMeasurements] = useState([])
  const [stats, setStats] = useState(null)
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return

    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const [list, summary] = await Promise.all([
          getWatchMeasurements(100),
          getWatchStats(period),
        ])
        setMeasurements(Array.isArray(list) ? list : [])
        setStats(summary || null)
      } catch (e) {
        setError(e.message || 'Không thể tải lịch sử hoạt động')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isAuthenticated, period])

  const formatDateTime = (value) => {
    if (!value) return 'N/A'
    const d = new Date(value)
    return d.toLocaleString('vi-VN', {
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
          <p>Bạn cần đăng nhập để xem lịch sử hoạt động đồng hồ.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history-container">
      <div className="history-card">
        <div className="history-header">
          <div>
            <h1 className="history-title">Lịch sử hoạt động đồng hồ</h1>
            <p className="history-subtitle">
              Xem lại các chỉ số sức khỏe được đồng bộ từ smartwatch của bạn
            </p>
          </div>
          <div className="history-controls">
            <label className="history-sort">
              <span>Thống kê:</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày</option>
                <option value="month">30 ngày</option>
                <option value="all">Tất cả</option>
              </select>
            </label>
          </div>
        </div>

        {error && <div className="history-error">{error}</div>}

        {loading ? (
          <div className="history-loading">
            <div className="history-spinner" />
            <p>Đang tải...</p>
          </div>
        ) : (
          <>
            {stats && (
              <div className="history-list" style={{ marginBottom: '16px' }}>
                <div className="history-item">
                  <div className="history-item-main">
                    <h3>Tổng quan ({stats.period || period})</h3>
                    <div className="history-item-meta">
                      <span>
                        Tổng bản ghi:{' '}
                        {stats.summary?.totalRecords ?? measurements.length}
                      </span>
                      {stats.summary?.activity && (
                        <>
                          <span>
                            Bước chân:{' '}
                            {stats.summary.activity.totalSteps ?? 0}
                          </span>
                          <span>
                            Calories:{' '}
                            {stats.summary.activity.totalCalories ?? 0}
                          </span>
                        </>
                      )}
                      {stats.summary?.lastMeasurement && (
                        <span>
                          Lần ghi gần nhất:{' '}
                          {formatDateTime(stats.summary.lastMeasurement)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {measurements.length === 0 ? (
              <div className="history-empty">
                <p>Bạn chưa có dữ liệu hoạt động nào từ smartwatch.</p>
                <p>
                  Hãy đảm bảo ứng dụng watch của bạn đã kết nối và gửi dữ liệu
                  về hệ thống.
                </p>
              </div>
            ) : (
              <div className="history-list">
                {measurements.map((m) => (
                  <div
                    key={m.id || m.measurement_id}
                    className="history-item"
                  >
                    <div className="history-item-main">
                      <h3>{m.type || 'measurement'}</h3>
                      <div className="history-item-meta">
                        <span className="history-item-date">
                          {formatDateTime(m.date || m.created_at)}
                        </span>
                        {typeof m.heartRate !== 'undefined' && (
                          <span>Nhịp tim: {m.heartRate} bpm</span>
                        )}
                        {typeof m.spO2 !== 'undefined' && (
                          <span>SpO₂: {m.spO2}%</span>
                        )}
                        {typeof m.stress !== 'undefined' && (
                          <span>Stress: {m.stress}</span>
                        )}
                        {(m.steps || m.calories) && (
                          <span>
                            Bước chân: {m.steps || 0} · Cal:{' '}
                            {m.calories || 0}
                          </span>
                        )}
                        {m.duration && <span>Thời lượng: {m.duration}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default WatchActivityPage


