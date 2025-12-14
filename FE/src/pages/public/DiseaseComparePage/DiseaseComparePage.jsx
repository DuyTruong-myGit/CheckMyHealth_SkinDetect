import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import diseaseService from '../../../services/features/diseaseService.js'
import { usePageTitle } from '../../../hooks/usePageTitle.js'
import ImageViewer from '../../../components/ui/ImageViewer/ImageViewer.jsx'
import '../../user/HistoryPage/History.css'
import './DiseaseComparePage.css'

const COMPARISON_FIELDS = [
  { key: 'disease_code', label: 'Mã bệnh', field: 'disease_code' },
  { key: 'description', label: 'Mô tả chung', field: 'description' },
  { key: 'symptoms', label: 'Triệu chứng', field: 'symptoms' },
  { key: 'identification_signs', label: 'Dấu hiệu nhận biết', field: 'identification_signs' },
  { key: 'prevention_measures', label: 'Cách phòng ngừa', field: 'prevention_measures' },
  { key: 'treatments_medications', label: 'Điều trị & thuốc', field: 'treatments_medications' },
  { key: 'dietary_advice', label: 'Lời khuyên về chế độ ăn', field: 'dietary_advice' },
]

const DiseaseComparePage = () => {
  usePageTitle('So sánh Bệnh lý')
  const navigate = useNavigate()
  const [diseaseA, setDiseaseA] = useState(null)
  const [diseaseB, setDiseaseB] = useState(null)
  const [searchA, setSearchA] = useState('')
  const [searchB, setSearchB] = useState('')
  const [searchResultsA, setSearchResultsA] = useState([])
  const [searchResultsB, setSearchResultsB] = useState([])
  const [showDropdownA, setShowDropdownA] = useState(false)
  const [showDropdownB, setShowDropdownB] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [allDiseases, setAllDiseases] = useState([])
  const dropdownARef = useRef(null)
  const dropdownBRef = useRef(null)

  useEffect(() => {
    loadAllDiseases()
  }, [])

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownARef.current && !dropdownARef.current.contains(event.target)) {
        setShowDropdownA(false)
      }
      if (dropdownBRef.current && !dropdownBRef.current.contains(event.target)) {
        setShowDropdownB(false)
      }
    }

    if (showDropdownA || showDropdownB) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdownA, showDropdownB])

  const loadAllDiseases = async () => {
    try {
      setLoading(true)
      const data = await diseaseService.getAll('')
      setAllDiseases(data || [])
    } catch (err) {
      console.error('Error loading diseases:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredResultsA = useMemo(() => {
    if (!searchA.trim()) return []
    const query = searchA.toLowerCase()
    return allDiseases
      .filter(d => 
        d.disease_name_vi?.toLowerCase().includes(query) ||
        d.disease_code?.toLowerCase().includes(query) ||
        d.symptoms?.toLowerCase().includes(query)
      )
      .slice(0, 10)
  }, [searchA, allDiseases])

  const filteredResultsB = useMemo(() => {
    if (!searchB.trim()) return []
    const query = searchB.toLowerCase()
    return allDiseases
      .filter(d => 
        (d.disease_name_vi?.toLowerCase().includes(query) ||
        d.disease_code?.toLowerCase().includes(query) ||
        d.symptoms?.toLowerCase().includes(query)) &&
        d.info_id !== diseaseA?.info_id // Exclude disease A if selected
      )
      .slice(0, 10)
  }, [searchB, allDiseases, diseaseA])

  const handleSelectDiseaseA = async (disease) => {
    setSearchA(disease.disease_name_vi)
    setShowDropdownA(false)
    // Load full details from API to get all fields
    try {
      setLoadingA(true)
      const fullDetails = await diseaseService.getById(disease.info_id)
      setDiseaseA(fullDetails)
    } catch (err) {
      console.error('Error loading disease A details:', err)
      // Fallback to basic info if API fails
      setDiseaseA(disease)
    } finally {
      setLoadingA(false)
    }
  }

  const handleSelectDiseaseB = async (disease) => {
    setSearchB(disease.disease_name_vi)
    setShowDropdownB(false)
    // Load full details from API to get all fields
    try {
      setLoadingB(true)
      const fullDetails = await diseaseService.getById(disease.info_id)
      setDiseaseB(fullDetails)
    } catch (err) {
      console.error('Error loading disease B details:', err)
      // Fallback to basic info if API fails
      setDiseaseB(disease)
    } finally {
      setLoadingB(false)
    }
  }

  const handleClearA = () => {
    setDiseaseA(null)
    setSearchA('')
  }

  const handleClearB = () => {
    setDiseaseB(null)
    setSearchB('')
  }

  const swapDiseases = () => {
    const tempDisease = diseaseA
    const tempSearch = searchA
    setDiseaseA(diseaseB)
    setDiseaseB(tempDisease)
    setSearchA(searchB)
    setSearchB(tempSearch)
  }

  return (
    <div className="history-container">
      <div className="history-card">
        <div className="history-header">
          <div>
            <h1 className="history-title">So sánh Bệnh lý</h1>
            <p className="history-subtitle">So sánh thông tin giữa hai bệnh lý</p>
          </div>
          <button
            className="history-new-btn"
            onClick={() => navigate('/diseases')}
          >
            ← Quay lại
          </button>
        </div>

        {/* Disease Selection */}
        <div className="compare-selection">
          <div className="compare-selection__column">
            <label className="compare-selection__label">Bệnh A</label>
            <div className="compare-selection__input-wrapper" ref={dropdownARef}>
              <input
                type="text"
                placeholder="Tìm kiếm bệnh lý..."
                value={searchA}
                onChange={(e) => {
                  setSearchA(e.target.value)
                  setShowDropdownA(true)
                }}
                onFocus={() => setShowDropdownA(true)}
                className="compare-selection__input"
              />
              {diseaseA && (
                <button
                  className="compare-selection__clear"
                  onClick={handleClearA}
                  title="Xóa"
                >
                  ×
                </button>
              )}
              {showDropdownA && filteredResultsA.length > 0 && (
                <div className="compare-selection__dropdown">
                  {filteredResultsA.map((disease) => (
                    <div
                      key={disease.info_id}
                      className="compare-selection__item"
                      onClick={() => handleSelectDiseaseA(disease)}
                    >
                      <div className="compare-selection__item-image">
                        {disease.image_url && (
                          <img src={disease.image_url} alt={disease.disease_name_vi} />
                        )}
                      </div>
                      <div className="compare-selection__item-info">
                        <div className="compare-selection__item-name">
                          {disease.disease_name_vi}
                        </div>
                        {disease.disease_code && (
                          <div className="compare-selection__item-code">
                            {disease.disease_code}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {loadingA ? (
              <div className="compare-selection__preview">
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Đang tải...
                </div>
              </div>
            ) : diseaseA && (
              <div className="compare-selection__preview">
                {diseaseA.image_url && (
                  <div className="compare-selection__preview-image">
                    <ImageViewer src={diseaseA.image_url} alt={diseaseA.disease_name_vi} />
                  </div>
                )}
                <div className="compare-selection__preview-name">
                  {diseaseA.disease_name_vi}
                </div>
              </div>
            )}
          </div>

          <div className="compare-selection__swap">
            <button
              className="compare-selection__swap-btn"
              onClick={swapDiseases}
              disabled={!diseaseA || !diseaseB}
              title="Đổi chỗ"
            >
              ⇄
            </button>
          </div>

          <div className="compare-selection__column">
            <label className="compare-selection__label">Bệnh B</label>
            <div className="compare-selection__input-wrapper" ref={dropdownBRef}>
              <input
                type="text"
                placeholder="Tìm kiếm bệnh lý..."
                value={searchB}
                onChange={(e) => {
                  setSearchB(e.target.value)
                  setShowDropdownB(true)
                }}
                onFocus={() => setShowDropdownB(true)}
                className="compare-selection__input"
              />
              {diseaseB && (
                <button
                  className="compare-selection__clear"
                  onClick={handleClearB}
                  title="Xóa"
                >
                  ×
                </button>
              )}
              {showDropdownB && filteredResultsB.length > 0 && (
                <div className="compare-selection__dropdown">
                  {filteredResultsB.map((disease) => (
                    <div
                      key={disease.info_id}
                      className="compare-selection__item"
                      onClick={() => handleSelectDiseaseB(disease)}
                    >
                      <div className="compare-selection__item-image">
                        {disease.image_url && (
                          <img src={disease.image_url} alt={disease.disease_name_vi} />
                        )}
                      </div>
                      <div className="compare-selection__item-info">
                        <div className="compare-selection__item-name">
                          {disease.disease_name_vi}
                        </div>
                        {disease.disease_code && (
                          <div className="compare-selection__item-code">
                            {disease.disease_code}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {loadingB ? (
              <div className="compare-selection__preview">
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Đang tải...
                </div>
              </div>
            ) : diseaseB && (
              <div className="compare-selection__preview">
                {diseaseB.image_url && (
                  <div className="compare-selection__preview-image">
                    <ImageViewer src={diseaseB.image_url} alt={diseaseB.disease_name_vi} />
                  </div>
                )}
                <div className="compare-selection__preview-name">
                  {diseaseB.disease_name_vi}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Results */}
        {diseaseA && diseaseB && !loadingA && !loadingB && (
          <div className="compare-results">
            {COMPARISON_FIELDS.map(({ key, label, field }) => {
              const valueA = diseaseA[field]
              const valueB = diseaseB[field]
              
              return (
                <div key={key} className="compare-results__card">
                  <div className="compare-results__label">{label}</div>
                  <div className="compare-results__content">
                    <div className="compare-results__side compare-results__side--a">
                      <div className="compare-results__side-content">
                        {valueA ? (
                          <div>{valueA}</div>
                        ) : (
                          <span className="compare-results__empty">Chưa có thông tin</span>
                        )}
                      </div>
                    </div>
                    <div className="compare-results__divider" />
                    <div className="compare-results__side compare-results__side--b">
                      <div className="compare-results__side-content">
                        {valueB ? (
                          <div>{valueB}</div>
                        ) : (
                          <span className="compare-results__empty">Chưa có thông tin</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {(loadingA || loadingB) && diseaseA && diseaseB && (
          <div className="compare-empty">
            <p>Đang tải thông tin chi tiết...</p>
          </div>
        )}

        {(!diseaseA || !diseaseB) && (
          <div className="compare-empty">
            <p>Vui lòng chọn hai bệnh lý để so sánh</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiseaseComparePage

