const ComingSoon = ({ title }) => {
  return (
    <section className="coming-soon">
      <h2>{title ?? 'Đang phát triển'}</h2>
      <p>Tính năng này sẽ sớm được cập nhật. Vui lòng quay lại sau.</p>
    </section>
  )
}

export default ComingSoon


