import { Routes, Route } from 'react-router-dom'
import AdminNavbar from './AdminNavbar'
import Dashboard from './Dashboard'
import Users from './Users'
import Medications from './Medications'
import Prescriptions from './Prescriptions'

function AdminHome() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <AdminNavbar />
      <div className="container-fluid py-4 px-4 px-md-5">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="medications" element={<Medications />} />
          <Route path="prescriptions" element={<Prescriptions />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminHome
