import { useEffect, useState } from 'react'
import api from '../config/api'

function Medications() {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    expireDate: ''
  })

  // -----------------------------
  // Fetch medications
  // -----------------------------
  const fetchMedications = async () => {
    try {
      setLoading(true)
      const res = await api.get('/medications')
      setMedications(res.data)
    } catch (err) {
      console.error('Error fetching medications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedications()
  }, [])

  // -----------------------------
  // Add medication
  // -----------------------------
  const handleAddMedication = async () => {
    if (!formData.medicineName || !formData.dosage || !formData.expireDate) {
      alert('All fields are required')
      return
    }

    try {
      setLoading(true)
      await api.post('/medications', formData)

      await fetchMedications()

      document.getElementById('addMedClose').click()

      setFormData({
        medicineName: '',
        dosage: '',
        expireDate: ''
      })
    } catch (err) {
      console.error('Error adding medication:', err)
      alert(err.response?.data?.message || 'Failed to add medication')
    } finally {
      setLoading(false)
    }
  }

  // -----------------------------
  // Handle form change
  // -----------------------------
  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // -----------------------------
  // Expiry status
  // -----------------------------
  const getStatus = expireDate => {
    return new Date(expireDate) >= new Date()
      ? { text: 'Valid', class: 'bg-success' }
      : { text: 'Expired', class: 'bg-danger' }
  }

  return (
    <>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Medication Inventory</h3>
          <small className="text-muted">
            Manage available medicines and expiry details
          </small>
        </div>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addMed"
        >
          + Add Medication
        </button>
      </div>

      {/* Medications Table */}
      <div className="card shadow-sm">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Medication Name</th>
                <th>Dosage</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : medications.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    No medications available
                  </td>
                </tr>
              ) : (
                medications.map(med => {
                  const status = getStatus(med.expireDate)
                  return (
                    <tr key={med._id}>
                      <td className="fw-semibold">{med.medicineName}</td>
                      <td>{med.dosage}</td>
                      <td>{new Date(med.expireDate).toLocaleDateString()}</td>
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

      {/* Add Medication Modal */}
      <div className="modal fade" id="addMed" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title fw-bold">Add New Medication</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                id="addMedClose"
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Medication Name</label>
                <input
                  className="form-control"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleChange}
                  placeholder="Enter medication name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Dosage</label>
                <input
                  className="form-control"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  placeholder="e.g. 500mg"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Expiry Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="expireDate"
                  value={formData.expireDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleAddMedication}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Medication'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default Medications
