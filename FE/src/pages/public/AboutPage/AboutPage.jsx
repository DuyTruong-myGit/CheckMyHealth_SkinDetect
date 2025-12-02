import { usePageTitle } from '../../../hooks/usePageTitle.js'

const AboutPage = () => {
  usePageTitle('Về CheckMyHealth')

  return (
    <div className="history-container">
      <div className="history-card">
        <h1 className="history-title">Về CheckMyHealth</h1>
        <p className="history-subtitle">
          Nền tảng hỗ trợ người dùng theo dõi sức khỏe da liễu và các chỉ số cơ bản
          thông qua AI và thiết bị đeo thông minh.
        </p>
        <div className="history-item-details">
          <h4>Tầm nhìn</h4>
          <p>
            Mang lại trải nghiệm kiểm tra sức khỏe thuận tiện, tin cậy và thân thiện
            cho mọi người, ở mọi nơi.
          </p>
          <h4>Công nghệ</h4>
          <p>
            Hệ thống sử dụng mô hình AI để phân tích hình ảnh da, kết hợp dữ liệu đo
            lường từ thiết bị đeo (nhịp tim, SpO₂, mức độ vận động...) để hỗ trợ người
            dùng theo dõi sức khỏe toàn diện hơn.
          </p>
          <h4>Bảo mật & riêng tư</h4>
          <p>
            Dữ liệu được lưu trữ an toàn, chỉ sử dụng cho mục đích cung cấp dịch vụ
            trong phạm vi bạn cho phép.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage


