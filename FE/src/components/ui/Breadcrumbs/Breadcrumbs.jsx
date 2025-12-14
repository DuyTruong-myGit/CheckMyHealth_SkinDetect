import { Link, useLocation } from 'react-router-dom'
import './Breadcrumbs.css'

const Breadcrumbs = ({ customLabels = {} }) => {
    const location = useLocation()
    const pathnames = location.pathname.split('/').filter((x) => x)

    const defaultLabels = {
        admin: 'Quản trị',
        users: 'Người dùng',
        diseases: 'Bệnh lý',
        news: 'Tin tức',
        feedback: 'Phản hồi',
        reports: 'Báo cáo',
        diagnosis: 'Chuẩn đoán',
        history: 'Lịch sử',
        profile: 'Hồ sơ',
        chat: 'Trò chuyện AI',
        schedule: 'Lịch hẹn',
        map: 'Bản đồ',
        'watch-activity': 'Hoạt động đồng hồ',
        about: 'Giới thiệu',
        faq: 'Câu hỏi thường gặp',
        // Add more as needed
    }

    const labels = { ...defaultLabels, ...customLabels }

    if (pathnames.length === 0) return null

    return (
        <nav className="breadcrumbs" aria-label="breadcrumb">
            <ol className="breadcrumbs__list">
                <li className="breadcrumbs__item">
                    <Link to="/" className="breadcrumbs__link">
                        🏠 Trang chủ
                    </Link>
                </li>
                {pathnames.map((name, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
                    const isLast = index === pathnames.length - 1
                    const label = labels[name] || name

                    return (
                        <li key={routeTo} className="breadcrumbs__item">
                            <span className="breadcrumbs__separator">›</span>
                            {isLast ? (
                                <span className="breadcrumbs__current" aria-current="page">
                                    {label}
                                </span>
                            ) : (
                                <Link to={routeTo} className="breadcrumbs__link">
                                    {label}
                                </Link>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

export default Breadcrumbs
