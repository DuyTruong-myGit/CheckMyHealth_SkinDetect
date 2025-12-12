import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import diseaseService from '../../../services/features/diseaseService.js'
import { Pagination, Skeleton, EmptyState } from '../../../components/ui'
import showToast from '../../../utils/toast'
import { usePageTitle } from '../../../hooks/usePageTitle.js'
import '../../user/HistoryPage/History.css'

const DiseasesPage = () => {
  usePageTitle('Bệnh lý')
  const navigate = useNavigate()
  const [diseases, setDiseases] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [customItemsPerPage, setCustomItemsPerPage] = useState(false)

  useEffect(() => {
    loadDiseases()
  }, [search])

  const loadDiseases = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await diseaseService.getAll(search)
      setDiseases(data || [])
      setCurrentPage(1)
    } catch (err) {
      console.error('Error loading diseases:', err)
      showToast.error('Lỗi khi tải danh sách bệnh lý')
    } finally {
      setLoading(false)
    }
  }

  const paginatedDiseases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return diseases.slice(startIndex, endIndex)
  }, [diseases, currentPage, itemsPerPage])

  const handleNavigateDetail = (id) => {
    navigate(`/diseases/${id}`)
  }

  return (
    <div className="history-container">
      <div className="history-card">
        <div className="history-header">
          <div>
            <h1 className="history-title">Bệnh lý</h1>
            <p className="history-subtitle">Tra cứu thông tin về các bệnh lý</p>
          </div>
          <button
            className="history-new-btn"
            onClick={() => navigate('/diseases/compare')}
          >
            So sánh bệnh lý
          </button>
        </div>

        {error && (
          <div style={{ background: '#fed7d7', color: '#c53030', padding: 12, borderRadius: 6, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên bệnh, mã bệnh hoặc triệu chứng (ví dụ: ngứa, đỏ, phát ban)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 16,
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                transition: 'all 0.2s',
                boxShadow: search ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = search ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none'
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 20,
                  color: '#6b7280',
                  padding: '4px 8px',
                  borderRadius: 4
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#1f2937'}
                onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                ×
              </button>
            )}
          </div>
          <p style={{
            marginTop: 8,
            fontSize: 13,
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            💡 Bạn có thể tìm kiếm bằng cách nhập triệu chứng như: "ngứa", "đỏ da", "phát ban", "mụn nước", v.v.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              <Skeleton variant="card" height="350px" count={6} />
            </div>
          </div>
        ) : diseases.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Không tìm thấy bệnh lý"
            message={search ? `Không tìm thấy bệnh lý nào phù hợp với "${search}"` : 'Không có bệnh lý nào trong hệ thống.'}
          />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
              {paginatedDiseases.map((disease) => (
                <div
                  key={disease.info_id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 16,
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  onClick={() => handleNavigateDetail(disease.info_id)}
                >
                  {disease.image_url && (
                    <div style={{ width: '100%', paddingBottom: '56.25%', position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
                      <img
                        src={disease.image_url}
                        alt={disease.disease_name_vi}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600, color: '#1a202c' }}>
                    {disease.disease_name_vi}
                  </h3>
                  {disease.disease_code && (
                    <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#6b7280' }}>
                      Mã: {disease.disease_code}
                    </p>
                  )}
                  {disease.symptoms && (
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: 13,
                      color: '#4b5563',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      <strong>Triệu chứng:</strong> {disease.symptoms}
                    </p>
                  )}
                  <span style={{ marginTop: 'auto', fontSize: 14, color: '#6366f1', fontWeight: 600 }}>
                    Xem chi tiết →
                  </span>
                </div>
              ))}
            </div>

            {diseases.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.max(1, Math.ceil(diseases.length / itemsPerPage))}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={diseases.length}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value)
                  setCurrentPage(1)
                }}
                customItemsPerPage={customItemsPerPage}
                onCustomItemsPerPageChange={setCustomItemsPerPage}
                itemLabel="bệnh lý"
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DiseasesPage

