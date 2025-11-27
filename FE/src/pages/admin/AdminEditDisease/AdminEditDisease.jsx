import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../AdminUsers/AdminUsers.css'
import diseaseService from '../../../services/features/diseaseService.js'
import ImageViewer from '../../../components/ui/ImageViewer/ImageViewer.jsx'
import { usePageTitle } from '../../../hooks/usePageTitle.js'

const AdminEditDisease = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  usePageTitle(isEditMode ? 'Chỉnh sửa bệnh lý' : 'Thêm bệnh lý mới')
  
  const [loading, setLoading] = useState(isEditMode)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    disease_code: '',
    disease_name_vi: '',
    description: '',
    symptoms: '',
    identification_signs: '',
    prevention_measures: '',
    treatments_medications: '',
    dietary_advice: '',
    source_references: '',
    image_url: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  useEffect(() => {
    if (isEditMode && id) {
      loadDisease()
    }
  }, [id, isEditMode])

  const loadDisease = async () => {
    try {
      setLoading(true)
      setError('')
      const disease = await diseaseService.getById(id)
      setFormData({
        disease_code: disease.disease_code || '',
        disease_name_vi: disease.disease_name_vi || '',
        description: disease.description || '',
        symptoms: disease.symptoms || '',
        identification_signs: disease.identification_signs || '',
        prevention_measures: disease.prevention_measures || '',
        treatments_medications: disease.treatments_medications || '',
        dietary_advice: disease.dietary_advice || '',
        source_references: disease.source_references || '',
        image_url: disease.image_url || ''
      })
      setImagePreview(disease.image_url || '')
      setImageFile(null)
    } catch (err) {
      console.error('Failed to load disease:', err)
      setError('Lỗi khi tải thông tin bệnh lý')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setFormData((prev) => ({ ...prev, image_url: '' }))
  }

  const handleImageUrlChange = (event) => {
    const url = event.target.value.trim()
    setFormData((prev) => ({ ...prev, image_url: url }))
    
    if (url) {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
      setImageFile(null)
      setImagePreview(url)
    } else {
      if (!imageFile) {
        setImagePreview('')
      }
    }
  }

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview('')
    setImageFile(null)
    setFormData((prev) => ({ ...prev, image_url: '' }))
  }

  const handleSave = async () => {
    if (!formData.disease_code || !formData.disease_name_vi) {
      setError('Vui lòng nhập mã bệnh và tên bệnh')
      return
    }

    try {
      setSaving(true)
      setError('')
      const payload = {
        ...formData
      }

      if (imageFile) {
        payload.image = imageFile
        payload.image_url = ''
      } else if (formData.image_url) {
        payload.image_url = formData.image_url.trim()
      } else {
        payload.image_url = ''
      }

      if (isEditMode) {
        await diseaseService.update(id, payload)
      } else {
        await diseaseService.create(payload)
      }
      
      // Navigate back to diseases list
      navigate('/admin/diseases')
    } catch (err) {
      console.error('Failed to save disease:', err)
      setError(err.response?.data?.message || 'Lỗi khi lưu bệnh lý')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/diseases')
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: 40, height: 40, border: '3px solid rgba(102, 126, 234, 0.2)', borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <p style={{ marginTop: 12, color: '#718096' }}>Đang tải...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>{isEditMode ? 'Chỉnh sửa bệnh lý' : 'Thêm bệnh lý mới'}</h1>
          <p>{isEditMode ? 'Cập nhật thông tin bệnh lý' : 'Thêm bệnh lý mới vào hệ thống'}</p>
        </div>
        <button className="btn" onClick={handleCancel}>
          Quay lại
        </button>
      </header>

      {error && (
        <div style={{ background: '#fed7d7', color: '#c53030', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid #e5e7eb' }}>
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
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Ảnh minh họa</label>
            {imagePreview ? (
              <div style={{ marginBottom: 8, background: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb', padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <ImageViewer 
                  src={imagePreview} 
                  alt="Xem trước ảnh bệnh"
                  className="disease-image-preview"
                />
                <div className="image-error" style={{ display: 'none', padding: '12px', background: '#fee', color: '#c33', borderRadius: 6, fontSize: 14 }}>
                  Không thể tải ảnh từ URL này. Vui lòng kiểm tra lại URL hoặc upload file.
                </div>
              </div>
            ) : (
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: 14 }}>Chưa có ảnh được chọn</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#4a5568' }}>Hoặc nhập URL ảnh:</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 4 }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#4a5568', marginRight: 8 }}>Hoặc</span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ fontSize: 14, color: '#4a5568', marginRight: 8 }}>Upload từ máy:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ flex: 1, minWidth: 200 }}
                />
                {imagePreview && (
                  <button type="button" className="btn" onClick={handleRemoveImage}>
                    Xóa ảnh
                  </button>
                )}
              </div>
            </div>
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
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
            </button>
            <button className="btn" onClick={handleCancel} disabled={saving}>
              Hủy
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminEditDisease

