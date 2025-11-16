import './Pagination.css'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
  customItemsPerPage,
  onCustomItemsPerPageChange,
  itemLabel = 'người dùng'
}) => {
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="pagination">
      <div className="pagination__info">
        <span>
          Hiển thị {startItem}-{endItem} trong tổng số {totalItems} {itemLabel}
        </span>
        <div className="pagination__per-page">
          <label>Hiển thị:</label>
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              const value = e.target.value
              if (value === 'custom') {
                onCustomItemsPerPageChange(true)
              } else {
                onItemsPerPageChange(Number(value))
                onCustomItemsPerPageChange(false)
              }
            }}
            className="pagination__select"
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
          {customItemsPerPage && (
            <input
              type="number"
              min="1"
              max="1000"
              placeholder="Nhập số"
              className="pagination__custom-input"
              onBlur={(e) => {
                const value = Number(e.target.value)
                if (value > 0 && value <= 1000) {
                  onItemsPerPageChange(value)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = Number(e.target.value)
                  if (value > 0 && value <= 1000) {
                    onItemsPerPageChange(value)
                    onCustomItemsPerPageChange(false)
                  }
                }
              }}
            />
          )}
        </div>
      </div>
      
      <div className="pagination__controls">
        <button
          className="pagination__btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          ««
        </button>
        <button
          className="pagination__btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </button>
        
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={`pagination__btn ${
              page === currentPage ? 'pagination__btn--active' : ''
            } ${page === '...' ? 'pagination__btn--ellipsis' : ''}`}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}
        
        <button
          className="pagination__btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ›
        </button>
        <button
          className="pagination__btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          »»
        </button>
      </div>
    </div>
  )
}

export default Pagination

