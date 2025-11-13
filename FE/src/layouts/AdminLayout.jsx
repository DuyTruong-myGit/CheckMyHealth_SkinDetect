import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

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


