import './SortableTableHeader.css'

const SortableTableHeader = ({ 
  column, 
  currentSort, 
  onSort, 
  children 
}) => {
  const isActive = currentSort.column === column
  const sortDirection = isActive ? currentSort.direction : null

  const handleClick = () => {
    if (isActive) {
      // Toggle direction: asc -> desc -> asc
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
      onSort(column, newDirection)
    } else {
      // Start with ascending
      onSort(column, 'asc')
    }
  }

  return (
    <th className="sortable-header" onClick={handleClick}>
      <div className="sortable-header__content">
        <span>{children}</span>
        <span className="sortable-header__arrows">
          <span 
            className={`sortable-header__arrow sortable-header__arrow--up ${
              sortDirection === 'asc' ? 'sortable-header__arrow--active' : ''
            }`}
          >
            ▲
          </span>
          <span 
            className={`sortable-header__arrow sortable-header__arrow--down ${
              sortDirection === 'desc' ? 'sortable-header__arrow--active' : ''
            }`}
          >
            ▼
          </span>
        </span>
      </div>
    </th>
  )
}

export default SortableTableHeader

