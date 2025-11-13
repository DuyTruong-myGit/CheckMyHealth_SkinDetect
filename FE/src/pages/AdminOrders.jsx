import { useEffect, useState } from 'react'
import { getOrders } from '../services/adminService.js'
import { formatCurrency, formatDateTime } from '../utils/format.js'

const AdminOrders = () => {
  const [state, setState] = useState({ loading: true, data: [], error: null })

  useEffect(() => {
    let isMounted = true
    getOrders()
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
          <h1>Đơn hàng</h1>
          <p>Danh sách đơn hàng mới nhất từ cơ sở dữ liệu skin_db.</p>
        </div>
        <button className="btn btn-primary" type="button">
          Tạo đơn hàng
        </button>
      </header>

      {state.loading && <p>Đang tải danh sách đơn hàng...</p>}
      {state.error && <p className="error-text">Không thể tải: {state.error}</p>}

      {!state.loading && !state.error && (
        <div className="data-table__wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {state.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="data-table__empty">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                state.data.map((order) => (
                  <tr key={order.id ?? order.orderId}>
                    <td>{order.code ?? order.orderId ?? '--'}</td>
                    <td>{order.customerName ?? '--'}</td>
                    <td>
                      <span className={`badge badge--${order.status ?? 'pending'}`}>
                        {order.status ?? 'pending'}
                      </span>
                    </td>
                    <td>{formatCurrency(order.totalAmount ?? order.total)}</td>
                    <td>{formatDateTime(order.createdAt)}</td>
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

export default AdminOrders

