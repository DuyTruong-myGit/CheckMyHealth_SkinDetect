import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/layout/AdminSidebar/AdminSidebar.jsx'
import SiteHeader from '../components/layout/SiteHeader/SiteHeader.jsx'

const AdminLayout = () => {
  return (
    <div className="admin-shell">
      <SiteHeader variant="admin" />
      <div className="admin-content">
        <AdminSidebar />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout


