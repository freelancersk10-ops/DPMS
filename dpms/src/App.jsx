import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import AdminHome from './admin/AdminHome'
import DoctorHome from './doctor/DoctorHome'
import PrescriptionForm from './doctor/PrescriptionForm'
import PatientHome from './pages/PatientHome'
import PharmacistHome from './pages/PharmacistHome'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin/*" element={<AdminHome />} />
      <Route path="/doctor" element={<DoctorHome />} />
      <Route path="/doctor/prescription-form" element={<PrescriptionForm />} />
      <Route path="/patient" element={<PatientHome />} />
      <Route path="/pharmacist" element={<PharmacistHome />} />
    </Routes>
  )
}

export default App
