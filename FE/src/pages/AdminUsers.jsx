import { useEffect, useState, useMemo } from 'react'
import { getUsers, createUser } from '../services/adminService.js'
import { formatDateAndTime } from '../utils/format.js'
import SortableTableHeader from '../components/SortableTableHeader.jsx'
import Pagination from '../components/Pagination.jsx'
import AddUserModal from '../components/AddUserModal.jsx'
import './AdminUsers.css'

const AdminUsers = () => {
  const [state, setState] = useState({ loading: true, data: [], error: null })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ column: 'user_id', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [customItemsPerPage, setCustomItemsPerPage] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addUserLoading, setAddUserLoading] = useState(false)

  // Fetch data
  useEffect(() => {
    let isMounted = true
    setState(prev => ({ ...prev, loading: true }))
    
    getUsers(searchTerm)
      .then((data) => {
        if (isMounted) {
          setState({ loading: false, data, error: null })
          setCurrentPage(1) // Reset to first page when search changes
        }
      })
      .catch((error) => {
        if (isMounted) setState({ loading: false, data: [], error: error.message })
      })
    return () => {
      isMounted = false
    }
  }, [searchTerm])

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...state.data]
    
    sorted.sort((a, b) => {
      let aValue = a[sortConfig.column]
      let bValue = b[sortConfig.column]

      // Handle different data types
      if (sortConfig.column === 'user_id') {
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      } else if (sortConfig.column === 'created_at') {
        aValue = new Date(aValue || 0).getTime()
        bValue = new Date(bValue || 0).getTime()
      } else {
        aValue = String(aValue || '').toLowerCase()
        bValue = String(bValue || '').toLowerCase()
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    return sorted
  }, [state.data, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (column, direction) => {
    setSortConfig({ column, direction })
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const handleAddUser = async (userData) => {
    setAddUserLoading(true)
    try {
      await createUser(userData)
      // Refresh data
      const data = await getUsers(searchTerm)
      setState({ loading: false, data, error: null })
      setShowAddModal(false)
      setCurrentPage(1)
    } catch (error) {
      alert(error.message || 'Không thể tạo người dùng')
    } finally {
      setAddUserLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Người dùng</h1>
          <p>Danh sách khách hàng và nhân viên đang hoạt động.</p>
        </div>
        <button 
          className="btn btn-primary" 
          type="button"
          onClick={() => setShowAddModal(true)}
        >
          Thêm người dùng
        </button>
      </header>

      {/* Search */}
      <div className="admin-users__search">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={handleSearch}
          className="admin-users__search-input"
        />
      </div>

      {state.loading && <p>Đang tải danh sách người dùng...</p>}
      {state.error && <p className="error-text">Không thể tải: {state.error}</p>}

      {!state.loading && !state.error && (
        <>
          <div className="data-table__wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <SortableTableHeader
                    column="user_id"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    ID
                  </SortableTableHeader>
                  <SortableTableHeader
                    column="email"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    Email
                  </SortableTableHeader>
                  <SortableTableHeader
                    column="full_name"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    Họ tên
                  </SortableTableHeader>
                  <SortableTableHeader
                    column="role"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    Vai trò
                  </SortableTableHeader>
                  <SortableTableHeader
                    column="account_status"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    Trạng thái
                  </SortableTableHeader>
                  <SortableTableHeader
                    column="created_at"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    Ngày tạo
                  </SortableTableHeader>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="data-table__empty">
                      {searchTerm ? 'Không tìm thấy người dùng nào.' : 'Chưa có người dùng nào.'}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((user) => (
                    <tr key={user.user_id ?? user.email}>
                      <td>{user.user_id ?? '--'}</td>
                      <td>{user.email ?? '--'}</td>
                      <td>{user.full_name ?? '--'}</td>
                      <td>{user.role ?? '--'}</td>
                      <td>
                        <span className={`badge badge--${user.account_status ?? 'active'}`}>
                          {user.account_status ?? 'active'}
                        </span>
                      </td>
                      <td>{formatDateAndTime(user.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {sortedData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={sortedData.length}
              onItemsPerPageChange={setItemsPerPage}
              customItemsPerPage={customItemsPerPage}
              onCustomItemsPerPageChange={setCustomItemsPerPage}
            />
          )}
        </>
      )}

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        loading={addUserLoading}
      />
    </section>
  )
}

export default AdminUsers
