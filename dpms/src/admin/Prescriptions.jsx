import { useEffect, useState } from 'react'
import api from '../config/api'

function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(false)

  // -----------------------------
  // Fetch prescriptions
  // -----------------------------
  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const res = await api.get('/prescriptions')
      setPrescriptions(res.data)
    } catch (err) {
      console.error('Error fetching prescriptions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  // -----------------------------
  // Status helper
  // -----------------------------
  const getStatus = prescription => {
    return prescription.isActive
      ? { text: 'Active', class: 'bg-success' }
      : { text: 'Inactive', class: 'bg-secondary' }
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-0">Prescriptions</h3>
        <small className="text-muted">
          View and manage issued prescriptions
        </small>
      </div>

      {/* Prescriptions Table */}
      <div className="card shadow-sm">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Prescription ID</th>
                <th>Doctor</th>
                <th>Patient</th>
                <th>Disease</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No prescriptions available
                  </td>
                </tr>
              ) : (
                prescriptions.map(p => {
                  const status = getStatus(p)
                  return (
                    <tr key={p._id}>
                      <td className="fw-semibold">
                        {p._id.slice(-6).toUpperCase()}
                      </td>
                      <td>{p.doctor?.name || '-'}</td>
                      <td>{p.patient?.name || '-'}</td>
                      <td>{p.disease || '-'}</td>
                      <td>{new Date(p.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${status.class}`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Prescriptions
