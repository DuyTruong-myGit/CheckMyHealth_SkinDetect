import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <section className="not-found">
      <h1>404</h1>
      <p>Xin lỗi, trang bạn tìm không tồn tại.</p>
      <Link className="btn btn-primary" to="/">
        Quay về trang chủ
      </Link>
    </section>
  )
}

export default NotFound


