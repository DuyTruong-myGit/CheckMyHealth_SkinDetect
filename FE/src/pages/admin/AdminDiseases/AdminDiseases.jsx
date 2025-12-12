import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import '../AdminUsers/AdminUsers.css'
import diseaseService from '../../../services/features/diseaseService.js'
import { Pagination, Skeleton, EmptyState } from '../../../components/ui'
import showToast from '../../../utils/toast'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog.jsx'
import { usePageTitle } from '../../../hooks/usePageTitle.js'

const AdminDiseases = () => {
  usePageTitle('Quản lý bệnh lý')
  const navigate = useNavigate()
  const [diseases, setDiseases] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [customItemsPerPage, setCustomItemsPerPage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importExportExpanded, setImportExportExpanded] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [debounceTimer, setDebounceTimer] = useState(null)

  const loadDiseases = async (keyword = searchTerm, preservePage = false) => {
    try {
      setLoading(true)
      setError('')
      const data = await diseaseService.getAll(keyword)
      setDiseases(data || [])
      if (!preservePage) {
        setCurrentPage(1)
      }
    } catch (err) {
      console.error('Failed to load diseases:', err)
      setError('Lỗi khi tải danh sách bệnh lý')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if returning from edit page
    const savedPage = sessionStorage.getItem('adminDiseases_page')
    const savedScroll = sessionStorage.getItem('adminDiseases_scroll')
    const savedSearch = sessionStorage.getItem('adminDiseases_search')

    if (savedPage) {
      setCurrentPage(parseInt(savedPage, 10))
    }
    if (savedSearch) {
      setSearchTerm(savedSearch)
      loadDiseases(savedSearch, !!savedPage)
    } else {
      loadDiseases('', !!savedPage)
    }

    // Clean up saved state
    if (savedPage) {
      sessionStorage.removeItem('adminDiseases_page')
    }
    if (savedSearch) {
      sessionStorage.removeItem('adminDiseases_search')
    }
  }, [])

  // Restore scroll position after diseases are loaded and page is set
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('adminDiseases_scroll')
    if (savedScroll && !loading && diseases.length > 0) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10))
        sessionStorage.removeItem('adminDiseases_scroll')
      }, 100)
    }
  }, [loading, diseases.length])

  // Real-time search with debounce
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      loadDiseases(searchTerm.trim())
    }, 500)

    setDebounceTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [searchTerm])

  const paginatedDiseases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return diseases.slice(startIndex, endIndex)
  }, [diseases, currentPage, itemsPerPage])

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  const handleAdd = () => {
    navigate('/admin/diseases/new')
  }

  const handleEdit = (disease) => {
    // Save current state before navigating
    sessionStorage.setItem('adminDiseases_page', currentPage.toString())
    sessionStorage.setItem('adminDiseases_scroll', window.scrollY.toString())
    sessionStorage.setItem('adminDiseases_search', searchTerm)
    navigate(`/admin/diseases/${disease.info_id}/edit`)
  }

  const handleDelete = async (id) => {
    try {
      setError('')
      await diseaseService.delete(id)
      showToast.success('Đã xóa bệnh lý thành công!')
      await loadDiseases()
    } catch (err) {
      console.error('Failed to delete disease:', err)
      showToast.error(err.response?.data?.message || 'Lỗi khi xóa bệnh lý')
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

  const handleExportAll = async () => {
    try {
      setError('')
      await diseaseService.exportAll('csv')
    } catch (err) {
      const errorMessage = err.message || 'Lỗi khi export dữ liệu'
      showToast.error(errorMessage)
    }
  }

  const handleExportSample = async () => {
    try {
      setError('')
      await diseaseService.exportSample('csv')
    } catch (err) {
      showToast.error(err.message || 'Lỗi khi export template')
    }
  }

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      setError('')
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      setError('Vui lòng chọn file để import')
      return
    }

    try {
      setImporting(true)
      setError('')
      setImportResult(null)
      const result = await diseaseService.import(importFile)
      setImportFile(null)
      // Reset file input
      const fileInput = document.getElementById('import-file-input')
      if (fileInput) fileInput.value = ''

      // Luôn hiển thị kết quả, có thể có duplicates
      if (result.duplicates && result.duplicates.length > 0) {
        setImportResult({
          type: 'duplicates',
          duplicates: result.duplicates,
          total: result.total,
          duplicates_count: result.duplicates_count,
          new_count: result.new_count,
          imported: result.imported
        })
      } else {
        setImportResult({
          type: 'success',
          imported: result.imported,
          total: result.total
        })
      }

      // Reload danh sách nếu có import thành công
      if (result.imported > 0) {
        await loadDiseases()
      }
    } catch (err) {
      const errorMessage = err.message || 'Lỗi khi import dữ liệu'
      showToast.error(errorMessage)
      setImportResult(null)
    } finally {
      setImporting(false)
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Bệnh lý</h1>
          <p>Quản lý danh sách bệnh lý da liễu</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã bệnh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', minWidth: 240 }}
            />
            {searchTerm && (
              <button type="button" className="btn" onClick={handleClearSearch}>
                Xóa
              </button>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>
            Thêm bệnh lý mới
          </button>
        </div>
      </header>

      {error && (
        <div style={{ background: '#fed7d7', color: '#c53030', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ background: '#f7fafc', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <button
            onClick={() => setImportExportExpanded(!importExportExpanded)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 600,
              color: '#4a5568',
              fontSize: '0.95rem'
            }}
          >
            <span>Import / Export</span>
            <span style={{ fontSize: '0.8rem', transition: 'transform 0.2s', transform: importExportExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▼
            </span>
          </button>
          {importExportExpanded && (
            <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#4a5568', minWidth: 80 }}>Export:</span>
                <button className="btn" onClick={handleExportAll} style={{ fontSize: '0.9rem' }}>
                  Export CSV
                </button>
                <span style={{ margin: '0 8px', color: '#cbd5e0' }}>|</span>
                <button className="btn" onClick={handleExportSample} style={{ fontSize: '0.9rem' }}>
                  Template CSV
                </button>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#4a5568', minWidth: 80 }}>Import:</span>
                <input
                  id="import-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleImportFileChange}
                  style={{ fontSize: '0.9rem' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleImport}
                  disabled={!importFile || importing}
                  style={{ fontSize: '0.9rem' }}
                >
                  {importing ? 'Đang import...' : 'Import'}
                </button>
              </div>
              {importResult && (
                <div style={{
                  padding: '12px',
                  borderRadius: 6,
                  background: importResult.type === 'duplicates' ? '#fff3cd' : '#d1e7dd',
                  border: `1px solid ${importResult.type === 'duplicates' ? '#ffc107' : '#28a745'}`
                }}>
                  {importResult.type === 'duplicates' ? (
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 8, color: '#856404' }}>
                        {importResult.imported > 0 ? (
                          <>✓ Đã import {importResult.imported} bệnh lý. Phát hiện {importResult.duplicates_count} bệnh trùng lặp:</>
                        ) : (
                          <>Phát hiện {importResult.duplicates_count} bệnh trùng lặp:</>
                        )}
                      </div>
                      <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                              <th style={{ padding: '6px', textAlign: 'left', borderBottom: '1px solid #dee2e6', border: '1px solid #dee2e6' }}>Mã bệnh</th>
                              <th style={{ padding: '6px', textAlign: 'left', borderBottom: '1px solid #dee2e6', border: '1px solid #dee2e6' }}>Tên bệnh (Import)</th>
                              <th style={{ padding: '6px', textAlign: 'left', borderBottom: '1px solid #dee2e6', border: '1px solid #dee2e6' }}>Tên bệnh (Hiện có)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importResult.duplicates.map((dup, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: '6px', border: '1px solid #f0f0f0' }}>{dup.disease_code}</td>
                                <td style={{ padding: '6px', border: '1px solid #f0f0f0' }}>{dup.disease_name_vi}</td>
                                <td style={{ padding: '6px', border: '1px solid #f0f0f0' }}>{dup.existing_name || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#856404' }}>
                        Tổng: {importResult.total} | Trùng: {importResult.duplicates_count} | Đã import: {importResult.imported}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#155724', fontWeight: 500 }}>
                      ✓ Import thành công {importResult.imported} bệnh lý (tổng {importResult.total} dòng)
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem' }}>
          <Skeleton variant="rectangular" height="400px" />
        </div>
      ) : diseases.length === 0 ? (
        <EmptyState
          icon="💡"
          title={searchTerm ? 'Không tìm thấy' : 'Chưa có bệnh lý'}
          message={searchTerm ? 'Không tìm thấy bệnh lý nào.' : 'Chưa có bệnh lý nào. Thêm bệnh lý mới để bắt đầu.'}
        />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {paginatedDiseases.map((d) => (
              <div key={d.info_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, border: '1px solid #e5e7eb', borderRadius: 6, gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  {d.image_url && (
                    <div style={{ width: 72, height: 72, flexShrink: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={d.image_url}
                        alt={d.disease_name_vi}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{d.disease_name_vi}</div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>Mã: {d.disease_code || 'N/A'}</div>
                    {d.description && (
                      <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 4, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.description}
                      </div>
                    )}
                  </div>
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

