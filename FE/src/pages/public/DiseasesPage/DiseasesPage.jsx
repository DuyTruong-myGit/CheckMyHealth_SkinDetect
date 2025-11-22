import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext.jsx'
import diseaseService from '../../../services/diseaseService'
import { usePageTitle } from '../../../hooks/usePageTitle.js'
import '../../user/HistoryPage/History.css'

const DiseasesPage = () => {
  usePageTitle('Bệnh lý')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [diseases, setDiseases] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDisease, setSelectedDisease] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadDiseases()
    }
  }, [isAuthenticated, search])

  const loadDiseases = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await diseaseService.getAll(search)
      setDiseases(data || [])
      setCurrentPage(1)
    } catch (err) {
      console.error('Error loading diseases:', err)
      setError('Lỗi khi tải danh sách bệnh lý')
    } finally {
      setLoading(false)
    }
  }

  const paginatedDiseases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return diseases.slice(startIndex, endIndex)
  }, [diseases, currentPage, itemsPerPage])

  const handleViewDetail = async (id) => {
    try {
      const detail = await diseaseService.getById(id)
      setSelectedDisease(detail)
    } catch (err) {
      console.error('Error loading disease detail:', err)
      setError('Lỗi khi tải chi tiết bệnh lý')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="history-container">
        <div className="history-card">
          <h2>Yêu cầu đăng nhập</h2>
          <p>Bạn cần đăng nhập để xem danh sách bệnh lý.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history-container">
      <div className="history-card">
        <div className="history-header">
          <div>
            <h1 className="history-title">Bệnh lý</h1>
            <p className="history-subtitle">Tra cứu thông tin về các bệnh lý da liễu</p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fed7d7', color: '#c53030', padding: 12, borderRadius: 6, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Tìm kiếm bệnh lý..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', fontSize: 16, border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
        </div>

        {loading ? (
          <div className="history-loading">
            <div className="history-spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : diseases.length === 0 ? (
          <div className="history-empty">
            <p>Không tìm thấy bệnh lý nào.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
              {paginatedDiseases.map((disease) => (
                <div
                  key={disease.info_id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 16,
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  onClick={() => handleViewDetail(disease.info_id)}
                >
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600, color: '#1a202c' }}>
                    {disease.disease_name_vi}
                  </h3>
                  {disease.disease_code && (
                    <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#6b7280' }}>
                      Mã: {disease.disease_code}
                    </p>
                  )}
                  <button
                    style={{
                      marginTop: 8,
                      padding: '6px 12px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>

            {diseases.length > itemsPerPage && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 4, background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Trước
                </button>
                <span style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                  Trang {currentPage} / {Math.ceil(diseases.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(diseases.length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(diseases.length / itemsPerPage)}
                  style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 4, background: 'white', cursor: currentPage >= Math.ceil(diseases.length / itemsPerPage) ? 'not-allowed' : 'pointer' }}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedDisease && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
          onClick={() => setSelectedDisease(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 8,
              padding: 24,
              maxWidth: 800,
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedDisease(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ×
            </button>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>{selectedDisease.disease_name_vi}</h2>
            {selectedDisease.disease_code && (
              <p style={{ color: '#6b7280', marginBottom: 16 }}>Mã: {selectedDisease.disease_code}</p>
            )}
            {selectedDisease.description && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8 }}>Mô tả</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedDisease.description}</p>
              </div>
            )}
            {selectedDisease.symptoms && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8 }}>Triệu chứng</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedDisease.symptoms}</p>
              </div>
            )}
            {selectedDisease.identification_signs && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8 }}>Dấu hiệu nhận biết</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedDisease.identification_signs}</p>
              </div>
            )}
            {selectedDisease.prevention_measures && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8 }}>Biện pháp phòng ngừa</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedDisease.prevention_measures}</p>
              </div>
            )}
            {selectedDisease.treatments_medications && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8 }}>Điều trị và thuốc</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedDisease.treatments_medications}</p>
              </div>
            )}
            {selectedDisease.dietary_advice && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8 }}>Lời khuyên về chế độ ăn</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedDisease.dietary_advice}</p>
              </div>
            )}
            {selectedDisease.source_references && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8 }}>Nguồn tham khảo</h3>
                <p style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#6b7280' }}>{selectedDisease.source_references}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DiseasesPage

