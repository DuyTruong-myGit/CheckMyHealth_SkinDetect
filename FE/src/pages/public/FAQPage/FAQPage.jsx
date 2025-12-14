import { usePageTitle } from '../../../hooks/usePageTitle.js'

const FAQPage = () => {
  usePageTitle('Câu hỏi thường gặp')

  const faqs = [
    {
      q: 'CheckMyHealth dùng để làm gì?',
      a: 'Ứng dụng giúp bạn chuẩn đoán sớm các vấn đề về da, lưu lịch sử chuẩn đoán và theo dõi một số chỉ số sức khỏe cơ bản.',
    },
    {
      q: 'Kết quả chuẩn đoán có thay thế bác sĩ được không?',
      a: 'Không. Kết quả chỉ mang tính chất tham khảo, bạn nên gặp bác sĩ chuyên khoa để được tư vấn chính xác.',
    },
    {
      q: 'Dữ liệu của tôi có được bảo mật không?',
      a: 'Hệ thống chỉ sử dụng dữ liệu để cung cấp dịch vụ trong phạm vi cho phép, không chia sẻ công khai cho bên thứ ba ngoài hệ thống.',
    },
  ]

  return (
    <div className="history-container">
      <div className="history-card">
        <h1 className="history-title">Câu hỏi thường gặp</h1>
        <div className="history-item-details">
          {faqs.map((item, idx) => (
            <details key={idx} style={{ marginBottom: '8px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                {item.q}
              </summary>
              <p style={{ marginTop: '4px' }}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQPage


