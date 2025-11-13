const SiteFooter = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>&copy; {new Date().getFullYear()} SkinCare Platform</p>
        <p className="site-footer__api-hint">Kết nối với backend @skin_be</p>
      </div>
    </footer>
  )
}

export default SiteFooter


