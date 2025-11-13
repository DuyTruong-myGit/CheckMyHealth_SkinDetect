import { useEffect, useState } from 'react'
import { getProducts } from '../services/adminService.js'
import { formatCurrency } from '../utils/format.js'

const AdminProducts = () => {
  const [state, setState] = useState({ loading: true, data: [], error: null })

  useEffect(() => {
    let isMounted = true
    getProducts()
      .then((data) => {
        if (isMounted) setState({ loading: false, data, error: null })
      })
      .catch((error) => {
        if (isMounted) setState({ loading: false, data: [], error: error.message })
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Sản phẩm & dịch vụ</h1>
          <p>Quản lý danh mục sản phẩm trong cơ sở dữ liệu skin_db.</p>
        </div>
        <button className="btn btn-primary" type="button">
          Thêm mới
        </button>
      </header>

      {state.loading && <p>Đang tải danh sách sản phẩm...</p>}
      {state.error && <p className="error-text">Không thể tải: {state.error}</p>}

      {!state.loading && !state.error && (
        <div className="data-table__wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên sản phẩm</th>
                <th>Loại</th>
                <th>Giá</th>
                <th>Kho</th>
              </tr>
            </thead>
            <tbody>
              {state.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="data-table__empty">
                    Chưa có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                state.data.map((product) => (
                  <tr key={product.id ?? product.code}>
                    <td>{product.code ?? product.id ?? '--'}</td>
                    <td>{product.name ?? '--'}</td>
                    <td>{product.category ?? product.type ?? '--'}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.stock ?? product.inventory ?? 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminProducts

