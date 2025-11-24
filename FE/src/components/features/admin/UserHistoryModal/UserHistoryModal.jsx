import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistoryForUser } from '../../../../services/features/adminService.js'
import { deleteHistory } from '../../../../services/features/diagnosisService.js'
import { formatDateAndTime } from '../../../../utils/format.js'
import ConfirmDialog from '../../../ui/ConfirmDialog/ConfirmDialog.jsx'
import './UserHistoryModal.css'

const UserHistoryModal = ({ isOpen, onClose, userId, userName }) => {
  const navigate = useNavigate()
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      fetchHistory()
    }
  }, [isOpen, userId])

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHistoryForUser(userId)
      // Normalize data giống như HistoryPage
      const safeParse = (value) => {
        if (!value) return null
        if (typeof value === 'object') return value
        try {
          return JSON.parse(value)
        } catch {
          return null
        }
      }

      const normalized = (data || []).map((entry) => {
        const parsed = safeParse(entry.result_json)
        const timestamp =
          entry.diagnosed_at ||
          entry.created_at ||
          entry.createdAt ||
          entry.updated_at ||
          null

        return {
          ...entry,
          result_json: parsed || entry.result_json,
          diagnosed_at: entry.diagnosed_at || null,
          created_at: entry.created_at || timestamp,
        }
      })
      setHistoryData(normalized)
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử chẩn đoán')
    } finally {
      setLoading(false)
    }
  }

  const getTimestamp = (item) =>
    item.diagnosed_at || item.created_at || item.createdAt || item.updated_at || null

  const getConfidence = (item) =>
    item.confidence_score ?? item.result_json?.confidence_score ?? null

  const getDiseaseName = (item) =>
    item.disease_name || item.result_json?.disease_name || 'Không xác định'

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A'
    const date = new Date(dateValue)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDeleteClick = (e, item) => {
    e.stopPropagation()
    const itemId = item.diagnosis_id || item.history_id
    if (itemId) {
      setDeleteTarget(itemId)
      setConfirmOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    
    try {
      setDeleting(true)
      setError(null)
      await deleteHistory(deleteTarget)
      setConfirmOpen(false)
      setDeleteTarget(null)
      await fetchHistory()
    } catch (err) {
      setError(err.message || 'Không thể xóa lịch sử chẩn đoán')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setConfirmOpen(false)
    setDeleteTarget(null)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Lịch sử chẩn đoán - {userName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading && <p className="loading-text">Đang tải dữ liệu...</p>}
          
          {error && <p className="error-text">Lỗi: {error}</p>}

          {!loading && !error && historyData.length === 0 && (
            <p className="empty-text">Chưa có lịch sử chẩn đoán nào.</p>
          )}

          {!loading && !error && historyData.length > 0 && (
            <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {historyData.map((item, index) => {
                const itemId = item.diagnosis_id || item.history_id || `history-${index}`
                const isExpanded = expandedId === itemId
                
                return (
                  <div key={itemId} className="history-item" style={{ 
                    background: '#f7fafc', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                  }}>
                    <div 
                      className="history-item-header"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedId(isExpanded ? null : itemId)
                      }}
                      style={{
                        display: 'flex',
                        gap: '1.5rem',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div className="history-item-image" style={{
                        flexShrink: 0,
                        width: '120px',
                        height: '120px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt="Diagnosis" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div className="history-item-placeholder" style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#cbd5e0'
                          }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="history-item-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1a202c', fontWeight: 600 }}>
                          {getDiseaseName(item)}
                        </h3>
                        <div className="history-item-meta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                          <span className="history-item-date" style={{ color: '#718096' }}>
                            {formatDate(getTimestamp(item))}
                          </span>
                          <span className="history-item-confidence" style={{
                            padding: '0.3rem 0.75rem',
                            background: 'rgba(102, 126, 234, 0.1)',
                            color: '#667eea',
                            borderRadius: '999px',
                            fontWeight: 600
                          }}>
                            Độ tin cậy: {getConfidence(item)
                              ? `${(getConfidence(item) * 100).toFixed(1)}%`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {!isExpanded && (
                          <button
                            className="history-item-delete"
                            onClick={(e) => handleDeleteClick(e, item)}
                            disabled={deleting}
                            title="Xóa lịch sử này"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc3545',
                              fontSize: '1rem',
                              cursor: 'pointer',
                              padding: '0.5rem',
                              borderRadius: '4px',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        )}
                        <button 
                          className="history-item-toggle"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedId(isExpanded ? null : itemId)
                          }}
                          style={{
                            flexShrink: 0,
                            background: 'none',
                            border: 'none',
                            color: '#667eea',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            padding: '0.25rem 0.5rem'
                          }}
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="history-item-details" style={{
                        padding: '0 1.5rem 1.5rem 1.5rem',
                        background: 'white',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        {item.result_json?.description && (
                          <div className="history-detail-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#667eea', fontWeight: 600 }}>Mô tả</h4>
                            <p style={{ margin: 0, color: '#4a5568', lineHeight: 1.6, fontSize: '0.9rem' }}>
                              {item.result_json.description}
                            </p>
                          </div>
                        )}
                        {item.result_json?.info_id && (
                          <div className="history-detail-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/diseases/${item.result_json.info_id}`)
                              }}
                              className="history-detail-link"
                              style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                width: '100%'
                              }}
                            >
                              Xem thông tin y khoa chi tiết
                            </button>
                          </div>
                        )}
                        <div className="history-detail-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => handleDeleteClick(e, item)}
                            className="history-delete-btn"
                            disabled={deleting}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              cursor: deleting ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                              textAlign: 'center',
                              width: '100%',
                              opacity: deleting ? 0.6 : 1
                            }}
                          >
                            {deleting && deleteTarget === (item.diagnosis_id || item.history_id) ? 'Đang xóa...' : 'Xóa lịch sử này'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa lịch sử chẩn đoán này? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonStyle={{ background: '#dc3545', color: 'white' }}
      />
    </div>
  )
}

export default UserHistoryModal
