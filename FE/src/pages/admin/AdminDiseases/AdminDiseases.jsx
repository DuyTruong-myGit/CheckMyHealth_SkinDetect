import { useEffect, useState, useMemo } from 'react'
import '../AdminUsers/AdminUsers.css'
import diseaseService from '../../../services/diseaseService'
import Pagination from '../../../components/ui/Pagination/Pagination.jsx'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog.jsx'
import { usePageTitle } from '../../../hooks/usePageTitle.js'

const AdminDiseases = () => {
  usePageTitle('Quản lý bệnh lý')
  const [diseases, setDiseases] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [customItemsPerPage, setCustomItemsPerPage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editingDisease, setEditingDisease] = useState(null)
  const [formData, setFormData] = useState({
    disease_code: '',
    disease_name_vi: '',
    description: '',
    symptoms: '',
    identification_signs: '',
    prevention_measures: '',
    treatments_medications: '',
    dietary_advice: '',
    source_references: ''
  })

  const loadDiseases = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await diseaseService.getAll()
      setDiseases(data || [])
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to load diseases:', err)
      setError('Lỗi khi tải danh sách bệnh lý')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiseases()
  }, [])

  const paginatedDiseases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return diseases.slice(startIndex, endIndex)
  }, [diseases, currentPage, itemsPerPage])

  const handleAdd = () => {
    setEditMode(true)
    setEditingDisease(null)
    setFormData({
      disease_code: '',
      disease_name_vi: '',
      description: '',
      symptoms: '',
      identification_signs: '',
      prevention_measures: '',
      treatments_medications: '',
      dietary_advice: '',
      source_references: ''
    })
  }

  const handleEdit = async (disease) => {
    try {
      setLoading(true)
      setError('')
      // Lấy đầy đủ thông tin bệnh từ API
      const fullDisease = await diseaseService.getById(disease.info_id)
      setEditMode(true)
      setEditingDisease(fullDisease)
      setFormData({
        disease_code: fullDisease.disease_code || '',
        disease_name_vi: fullDisease.disease_name_vi || '',
        description: fullDisease.description || '',
        symptoms: fullDisease.symptoms || '',
        identification_signs: fullDisease.identification_signs || '',
        prevention_measures: fullDisease.prevention_measures || '',
        treatments_medications: fullDisease.treatments_medications || '',
        dietary_advice: fullDisease.dietary_advice || '',
        source_references: fullDisease.source_references || ''
      })
    } catch (err) {
      console.error('Failed to load disease details:', err)
      setError('Lỗi khi tải thông tin chi tiết bệnh lý')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.disease_code || !formData.disease_name_vi) {
      setError('Vui lòng nhập mã bệnh và tên bệnh')
      return
    }

    try {
      setError('')
      if (editingDisease) {
        await diseaseService.update(editingDisease.info_id, formData)
      } else {
        await diseaseService.create(formData)
      }
      setEditMode(false)
      setEditingDisease(null)
      await loadDiseases()
    } catch (err) {
      console.error('Failed to save disease:', err)
      setError(err.response?.data?.message || 'Lỗi khi lưu bệnh lý')
    }
  }

  const handleDelete = async (id) => {
    try {
      setError('')
      await diseaseService.delete(id)
      await loadDiseases()
    } catch (err) {
      console.error('Failed to delete disease:', err)
      setError(err.response?.data?.message || 'Lỗi khi xóa bệnh lý')
    }
  }

  const openConfirm = (id, name) => {
    setConfirmTarget(id)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return
    try {
      setConfirmOpen(false)
      await handleDelete(confirmTarget)
    } catch (err) {
      // handleDelete already sets error
    } finally {
      setConfirmTarget(null)
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Bệnh lý</h1>
          <p>Quản lý danh sách bệnh lý da liễu</p>
        </div>
        {!editMode && (
          <button className="btn btn-primary" onClick={handleAdd}>
            Thêm bệnh lý mới
          </button>
        )}
      </header>

      {error && (
        <div style={{ background: '#fed7d7', color: '#c53030', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {editMode ? (
        <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <h2 style={{ marginTop: 0 }}>{editingDisease ? 'Chỉnh sửa bệnh lý' : 'Thêm bệnh lý mới'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Mã bệnh *</label>
              <input
                type="text"
                value={formData.disease_code}
                onChange={(e) => setFormData({ ...formData, disease_code: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 4 }}
                placeholder="VD: E11.9"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Tên bệnh (Tiếng Việt) *</label>
              <input
                type="text"
                value={formData.disease_name_vi}
                onChange={(e) => setFormData({ ...formData, disease_name_vi: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 4 }}
                placeholder="VD: Bệnh vẩy nến"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 4, minHeight: 100 }}
                placeholder="Mô tả về bệnh..."
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Triệu chứng</label>
              <textarea
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 4, minHeight: 100 }}
                placeholder="Các triệu chứng của bệnh..."
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Dấu hiệu nhận biết</label>
              <textarea
                value={formData.identification_signs}
                onChange={(e) => setFormData({ ...formData, identification_signs: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 4, minHeight: 100 }}
                placeholder="Các dấu hiệu nhận biết..."
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Biện pháp phòng ngừa</label>
              <textarea
                value={formData.prevention_measures}
                onChange={(e) => setFormData({ ...formData, prevention_measures: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 4, minHeight: 100 }}
                placeholder="Các biện pháp phòng ngừa..."
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Điều trị và thuốc</label>
              <textarea
                value={formData.treatments_medications}
                onChange={(e) => setFormData({ ...formData, treatments_medications: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 4, minHeight: 100 }}
                placeholder="Phương pháp điều trị và thuốc..."
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Lời khuyên về chế độ ăn</label>
              <textarea
                value={formData.dietary_advice}
                onChange={(e) => setFormData({ ...formData, dietary_advice: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 4, minHeight: 100 }}
                placeholder="Lời khuyên về chế độ ăn uống..."
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Nguồn tham khảo</label>
              <textarea
                value={formData.source_references}
                onChange={(e) => setFormData({ ...formData, source_references: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 4, minHeight: 80 }}
                placeholder="Các nguồn tham khảo..."
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {editingDisease ? 'Cập nhật' : 'Thêm mới'}
              </button>
              <button className="btn" onClick={() => { setEditMode(false); setEditingDisease(null); setError('') }}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ display: 'inline-block', width: 40, height: 40, border: '3px solid rgba(102, 126, 234, 0.2)', borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              <p style={{ marginTop: 12, color: '#718096' }}>Đang tải...</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : diseases.length === 0 ? (
            <p>Chưa có bệnh lý nào. Thêm bệnh lý mới để bắt đầu.</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {paginatedDiseases.map((d) => (
                  <div key={d.info_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, border: '1px solid #e5e7eb', borderRadius: 6 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{d.disease_name_vi}</div>
                      <div style={{ color: '#6b7280', fontSize: 14 }}>Mã: {d.disease_code || 'N/A'}</div>
                      {d.description && (
                        <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 4, maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.description}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" onClick={() => handleEdit(d)}>Sửa</button>
                      <button className="btn" onClick={() => openConfirm(d.info_id, d.disease_name_vi)}>Xóa</button>
                    </div>
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
                  onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1) }}
                  customItemsPerPage={customItemsPerPage}
                  onCustomItemsPerPageChange={setCustomItemsPerPage}
                  itemLabel="bệnh lý"
                />
              )}
            </>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bệnh lý"
        message="Bạn có chắc muốn xóa bệnh lý này?"
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </section>
  )
}

export default AdminDiseases

