import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../config/api'

function DoctorHome() {
  const location = useLocation()
  const navigate = useNavigate()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  useEffect(() => {
    fetchPrescriptions()
    
    // Check for success message from navigation state
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage)
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
      // Clear location state to prevent showing message on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const res = await api.get('/prescriptions/my-doctor')
      setPrescriptions(res.data)
    } catch (err) {
      console.error('Error fetching prescriptions:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Doctor Dashboard</h3>
          <small className="text-muted">Manage your prescriptions</small>
        </div>
        <div className="d-flex gap-2">
          <Link to="/doctor/prescription-form" className="btn btn-primary">
            Add New Prescription
          </Link>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success!</strong> {successMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccessMessage('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white fw-semibold">
          My Prescriptions
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Patient</th>
                <th>Disease</th>
                <th>Type</th>
                <th>Medicines</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    No prescriptions added yet
                  </td>
                </tr>
              ) : (
                prescriptions.map(presc => (
                  <tr key={presc._id}>
                    <td className="fw-semibold">
                      {presc.patient?.name || '-'}
                    </td>
                    <td>{presc.disease}</td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {presc.diseaseType}
                      </span>
                    </td>
                    <td>
                      {presc.medications && presc.medications.length > 0 ? (
                        presc.medications.map((med, idx) => (
                          <div key={idx} className="border rounded p-2 bg-light mb-2">
                            <div className="fw-semibold">
                              {med.medicine?.medicineName} ({med.medicine?.dosage})
                            </div>
                            <div className="small text-muted mt-1">
                              Timing: {med.timing?.join(', ') || 'N/A'}
                            </div>
                            <div className="small mt-1">
                              Date: {new Date(presc.date).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        'No medicines'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DoctorHome