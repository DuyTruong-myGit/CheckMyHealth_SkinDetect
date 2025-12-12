import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../../../contexts/AuthContext.jsx'
import { usePageTitle } from '../../../hooks/usePageTitle.js'
import { getWatchMeasurements, getWatchStats } from '../../../services/features/watchService.js'
import Pagination from '../../../components/ui/Pagination/Pagination.jsx'

const WatchActivityPage = () => {
  usePageTitle('Lịch sử hoạt động đồng hồ')
  const { isAuthenticated } = useAuth()

  const [measurements, setMeasurements] = useState([])
  const [stats, setStats] = useState(null)
  const [period, setPeriod] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [customItemsPerPage, setCustomItemsPerPage] = useState(false)

  // Helper function to calculate statistics from measurements
  const calculateStats = (measurements) => {
    if (!measurements || measurements.length === 0) return null

    const heartRates = measurements.map(m => m.heartRate || 0)
    const spO2s = measurements.map(m => m.spO2 || 0)
    const stresses = measurements.map(m => m.stress || 0)
    const totalSteps = measurements.reduce((sum, m) => sum + (m.steps || 0), 0)
    const totalCalories = measurements.reduce((sum, m) => sum + (m.calories || 0), 0)

    const avgHeartRate = heartRates.length > 0
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : 0
    const avgSpO2 = spO2s.length > 0
      ? Math.round(spO2s.reduce((a, b) => a + b, 0) / spO2s.length)
      : 0
    const avgStress = stresses.length > 0
      ? Math.round(stresses.reduce((a, b) => a + b, 0) / stresses.length)
      : 0

    const lastMeasurement = measurements.length > 0 ? measurements[0].date : null

    return {
      totalRecords: measurements.length,
      heartRate: { average: avgHeartRate },
      spO2: { average: avgSpO2 },
      stress: { average: avgStress },
      activity: { totalSteps, totalCalories },
      lastMeasurement
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const list = await getWatchMeasurements(500) // Fetch more data for client-side pagination
        const allMeasurements = Array.isArray(list) ? list : []
        setMeasurements(allMeasurements)

        // Calculate stats client-side based on period
        let filteredMeasurements = allMeasurements
        if (period !== 'all') {
          const now = new Date()
          let cutoffDate = new Date()

          if (period === 'today') {
            cutoffDate.setHours(0, 0, 0, 0)
          } else if (period === 'week') {
            cutoffDate.setDate(now.getDate() - 7)
          } else if (period === 'month') {
            cutoffDate.setDate(now.getDate() - 30)
          }

          filteredMeasurements = allMeasurements.filter(m => new Date(m.date) >= cutoffDate)
        }

        const calculatedStats = calculateStats(filteredMeasurements)
        setStats(calculatedStats ? { period, summary: calculatedStats } : null)
      } catch (e) {
        setError(e.message || 'Không thể tải lịch sử hoạt động')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isAuthenticated, period])

  // Reset to page 1 when period changes
  useEffect(() => {
    setCurrentPage(1)
  }, [period])

  // Filter measurements by period
  const filteredMeasurements = useMemo(() => {
    if (period === 'all') return measurements

    const now = new Date()
    let cutoffDate = new Date()

    if (period === 'today') {
      cutoffDate.setHours(0, 0, 0, 0)
    } else if (period === 'week') {
      cutoffDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      cutoffDate.setDate(now.getDate() - 30)
    }

    return measurements.filter(m => new Date(m.date) >= cutoffDate)
  }, [measurements, period])

  // Paginated measurements slice
  const paginatedMeasurements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredMeasurements.slice(startIndex, endIndex)
  }, [filteredMeasurements, currentPage, itemsPerPage])

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
                        <span role="img" aria-label="record">
                          📊
                        </span>{' '}
                        Tổng bản ghi:{' '}
                        {stats.summary?.totalRecords ?? measurements.length}
                      </span>
                      {stats.summary?.activity && (
                        <>
                          <span>
                            <span role="img" aria-label="steps">
                              👣
                            </span>{' '}
                            Bước chân:{' '}
                            {stats.summary.activity.totalSteps ?? 0}
                          </span>
                          <span>
                            <span role="img" aria-label="calories">
                              🔥
                            </span>{' '}
                            Calories:{' '}
                            {stats.summary.activity.totalCalories ?? 0}
                          </span>
                        </>
                      )}
                      {stats.summary?.heartRate && (
                        <span>
                          <span role="img" aria-label="heart-rate">
                            ❤️
                          </span>{' '}
                          Nhịp tim TB:{' '}
                          {stats.summary.heartRate.average ?? 0} bpm
                        </span>
                      )}
                      {stats.summary?.spO2 && (
                        <span>
                          <span role="img" aria-label="oxygen">
                            💨
                          </span>{' '}
                          SpO₂ TB:{' '}
                          {stats.summary.spO2.average ?? 0}%
                        </span>
                      )}
                      {stats.summary?.stress && (
                        <span>
                          <span role="img" aria-label="stress">
                            😌
                          </span>{' '}
                          Stress TB:{' '}
                          {stats.summary.stress.average ?? 0}
                        </span>
                      )}
                      {stats.summary?.lastMeasurement && (
                        <span>
                          <span role="img" aria-label="clock">
                            ⏱️
                          </span>{' '}
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
              <>
                <div className="history-list">
                  {paginatedMeasurements.map((m) => (
                    <div
                      key={m.id || m.measurement_id}
                      className="history-item"
                    >
                      <div className="history-item-main">
                        <h3>
                          <span role="img" aria-label="activity">
                            ⌚
                          </span>{' '}
                          {m.type || 'Hoạt động'}
                        </h3>
                        <div className="history-item-meta">
                          <span className="history-item-date">
                            <span role="img" aria-label="time">
                              🕒
                            </span>{' '}
                            {formatDateTime(m.date || m.created_at)}
                          </span>
                          {typeof m.heartRate !== 'undefined' && (
                            <span>
                              <span role="img" aria-label="heart-rate">
                                ❤️
                              </span>{' '}
                              Nhịp tim: {m.heartRate} bpm
                            </span>
                          )}
                          {typeof m.spO2 !== 'undefined' && (
                            <span>
                              <span role="img" aria-label="oxygen">
                                💨
                              </span>{' '}
                              SpO₂: {m.spO2}%
                            </span>
                          )}
                          {typeof m.stress !== 'undefined' && (
                            <span>
                              <span role="img" aria-label="stress">
                                😌
                              </span>{' '}
                              Stress: {m.stress}
                            </span>
                          )}
                          {(typeof m.steps !== 'undefined' || typeof m.calories !== 'undefined') && (
                            <span>
                              <span role="img" aria-label="steps">
                                👣
                              </span>{' '}
                              Bước chân: {m.steps ?? 0} ·{' '}
                              <span role="img" aria-label="calories">
                                🔥
                              </span>{' '}
                              Cal: {m.calories ?? 0}
                            </span>
                          )}
                          {m.duration && (
                            <span>
                              <span role="img" aria-label="duration">
                                ⏱️
                              </span>{' '}
                              Thời lượng: {m.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredMeasurements.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.max(1, Math.ceil(filteredMeasurements.length / itemsPerPage))}
                      onPageChange={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                      totalItems={filteredMeasurements.length}
                      onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1) }}
                      customItemsPerPage={customItemsPerPage}
                      onCustomItemsPerPageChange={setCustomItemsPerPage}
                      itemLabel="bản ghi"
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default WatchActivityPage


