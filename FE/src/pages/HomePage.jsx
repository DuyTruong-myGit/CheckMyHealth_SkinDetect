import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import './HomePage.css'

const HomePage = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero__content">
          <h1 className="home-hero__title">
            CheckMyHealth
            <span className="home-hero__subtitle">Nền tảng kiểm tra sức khỏe</span>
          </h1>
          <p className="home-hero__description">
            Chẩn đoán bệnh da liễu nhanh chóng và chính xác với công nghệ AI tiên tiến. 
            Tải lên hình ảnh và nhận kết quả chẩn đoán trong vài giây.
          </p>
          <div className="home-hero__actions">
            {isAuthenticated ? (
              <>
                <Link to="/diagnosis" className="btn btn-primary">
                  Bắt đầu chẩn đoán
                </Link>
                <Link to="/history" className="btn btn-secondary">
                  Xem lịch sử
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Đăng ký ngay
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="home-hero__image">
          <div className="home-hero__illustration">
            <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="150" r="80" fill="#667eea" opacity="0.2"/>
              <circle cx="200" cy="150" r="50" fill="#764ba2" opacity="0.3"/>
              <path d="M180 130 L200 150 L220 130" stroke="#667eea" strokeWidth="3" fill="none"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features">
        <h2 className="home-section-title">Tính năng nổi bật</h2>
        <div className="home-features__grid">
          <div className="home-feature-card">
            <div className="home-feature-icon">🔍</div>
            <h3>Chẩn đoán nhanh chóng</h3>
            <p>Nhận kết quả chẩn đoán trong vài giây với độ chính xác cao</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">📊</div>
            <h3>Lịch sử đầy đủ</h3>
            <p>Lưu trữ và xem lại tất cả các lần chẩn đoán của bạn</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">🔒</div>
            <h3>Bảo mật thông tin</h3>
            <p>Dữ liệu của bạn được bảo vệ an toàn và riêng tư</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">💡</div>
            <h3>Khuyến nghị hữu ích</h3>
            <p>Nhận các gợi ý và khuyến nghị dựa trên kết quả chẩn đoán</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="home-how-it-works">
        <h2 className="home-section-title">Cách sử dụng</h2>
        <div className="home-steps">
          <div className="home-step">
            <div className="home-step-number">1</div>
            <h3>Đăng ký tài khoản</h3>
            <p>Tạo tài khoản miễn phí để bắt đầu sử dụng dịch vụ</p>
          </div>
          <div className="home-step">
            <div className="home-step-number">2</div>
            <h3>Tải lên hình ảnh</h3>
            <p>Chụp hoặc tải lên hình ảnh vùng da cần kiểm tra</p>
          </div>
          <div className="home-step">
            <div className="home-step-number">3</div>
            <h3>Nhận kết quả</h3>
            <p>Xem kết quả chẩn đoán cùng với các khuyến nghị</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="home-cta">
          <h2>Sẵn sàng bắt đầu?</h2>
          <p>Đăng ký ngay để trải nghiệm dịch vụ chẩn đoán miễn phí</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Đăng ký miễn phí
          </Link>
        </section>
      )}
    </div>
  )
}

export default HomePage
