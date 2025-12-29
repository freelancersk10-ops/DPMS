import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../config/api'

function PatientHome() {
  const navigate = useNavigate()
  const [qrs, setQrs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reminders, setReminders] = useState({ morning: [], afternoon: [], night: [] })
  const [showReminders, setShowReminders] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  useEffect(() => {
    fetchMyQRs()
    fetchReminders()
    // Get user email from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserEmail(user.email || '')
  }, [])

  // Check for upcoming medication times
  useEffect(() => {
    const checkMedicationTime = () => {
      const now = new Date()
      const hour = now.getHours()
      
      // Morning: 7:00 AM - 9:00 AM
      if (hour >= 7 && hour < 9 && reminders.morning.length > 0) {
        showMedicationAlert('morning', reminders.morning)
      }
      // Afternoon: 1:00 PM - 3:00 PM
      else if (hour >= 13 && hour < 15 && reminders.afternoon.length > 0) {
        showMedicationAlert('afternoon', reminders.afternoon)
      }
      // Night: 7:00 PM - 9:00 PM
      else if (hour >= 19 && hour < 21 && reminders.night.length > 0) {
        showMedicationAlert('night', reminders.night)
      }
    }

    // Check immediately
    checkMedicationTime()
    
    // Check every hour
    const interval = setInterval(checkMedicationTime, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [reminders])

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders/patient')
      setReminders(res.data)
    } catch (err) {
      console.error('Error fetching reminders:', err)
    }
  }

  const showMedicationAlert = (timing, medications) => {
    const timingText = {
      morning: 'Morning',
      afternoon: 'Afternoon',
      night: 'Night'
    }
    
    const medList = medications.map(m => m.medicineName).join(', ')
    
    if (window.confirm(
      `💊 Medication Reminder!\n\nIt's time for your ${timingText[timing]} medication.\n\nMedications: ${medList}\n\nEmail reminder has been sent to ${userEmail || 'your email'}.\n\nHave you taken your medication?`
    )) {
      // User confirmed they took medication
      console.log('Patient confirmed medication taken')
    }
  }

  const fetchMyQRs = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/qr/my')
      setQrs(res.data)
    } catch (err) {
      console.error('Error fetching QRs:', err)
      setError(err.response?.data?.message || 'Failed to fetch QR codes')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (qrCode, prescriptionId) => {
    if (!qrCode) {
      alert('QR code not available for download')
      return
    }

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a')
    link.href = qrCode
    link.download = `prescription-qr-${prescriptionId?.slice(-6) || 'qr'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getTimingDisplay = (timing) => {
    if (!timing || !Array.isArray(timing)) return 'N/A'
    const timingMap = { M: 'Morning', A: 'Afternoon', N: 'Night' }
    return timing.map(t => timingMap[t] || t).join(', ')
  }

  const checkAllAmountsEntered = (prescription) => {
    if (!prescription?.medications) return false
    return prescription.medications.length > 0 &&
      prescription.medications.every(med => med.amount !== null && med.amount !== undefined)
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">My Prescriptions</h3>
          <small className="text-muted">View your prescription QR codes and medication details</small>
        </div>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Medication Reminders Section */}
      {showReminders && (reminders.morning.length > 0 || reminders.afternoon.length > 0 || reminders.night.length > 0) && (
        <div className="card shadow-sm mb-4 border-warning">
          <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">
              <span className="me-2">🔔</span>
              Medication Reminders
            </h6>
            <button 
              className="btn btn-sm btn-outline-dark"
              onClick={() => setShowReminders(false)}
            >
              Hide
            </button>
          </div>
          <div className="card-body">
            <p className="text-muted small mb-3">
              <strong>Email notifications:</strong> You will receive email reminders at scheduled times.
              {userEmail ? ` Notifications sent to: ${userEmail}` : ' Please add your email address in your profile.'}
            </p>
            
            <div className="row g-3">
              {reminders.morning.length > 0 && (
                <div className="col-md-4">
                  <div className="border rounded p-3 bg-light">
                    <h6 className="fw-bold text-warning mb-2">
                      🌅 Morning (8:00 AM)
                    </h6>
                    <ul className="list-unstyled mb-0 small">
                      {reminders.morning.map((med, idx) => (
                        <li key={idx} className="mb-1">
                          • {med.medicineName} ({med.dosage})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {reminders.afternoon.length > 0 && (
                <div className="col-md-4">
                  <div className="border rounded p-3 bg-light">
                    <h6 className="fw-bold text-info mb-2">
                      ☀️ Afternoon (2:00 PM)
                    </h6>
                    <ul className="list-unstyled mb-0 small">
                      {reminders.afternoon.map((med, idx) => (
                        <li key={idx} className="mb-1">
                          • {med.medicineName} ({med.dosage})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {reminders.night.length > 0 && (
                <div className="col-md-4">
                  <div className="border rounded p-3 bg-light">
                    <h6 className="fw-bold text-dark mb-2">
                      🌙 Night (8:00 PM)
                    </h6>
                    <ul className="list-unstyled mb-0 small">
                      {reminders.night.map((med, idx) => (
                        <li key={idx} className="mb-1">
                          • {med.medicineName} ({med.dosage})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error!</strong> {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading prescriptions...</p>
        </div>
      ) : qrs.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <div className="mb-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="64" 
                height="64" 
                fill="currentColor" 
                className="bi bi-qr-code text-muted" 
                viewBox="0 0 16 16"
              >
                <path d="M2 2h2v2H2V2Z"/>
                <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z"/>
                <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"/>
                <path d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8v1h2v1H6v1H5V8h1Zm0 0v1H5V8h1Zm1 0h1v1H7V8Zm-1 4v1h2v1H6v1H5v-2h1Zm0 0h1v1H6v-1Zm4 0v1h2v1h-2v1h-1v-2h1Zm0 0v1h-1v-1h1Z"/>
              </svg>
            </div>
            <h5 className="text-muted">No Prescriptions Available</h5>
            <p className="text-muted mb-0">
              You don't have any prescription QR codes yet. QR codes are generated by your doctor after creating a prescription.
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {qrs.map((qr) => {
            const amountsEntered = checkAllAmountsEntered(qr.prescription)
            const totalAmount = qr.prescription?.medications?.reduce(
              (sum, med) => sum + (Number(med.amount) || 0),
              0
            ) || 0

            return (
              <div key={qr._id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 fw-semibold">Prescription</h6>
                      {qr.prescription && (
                        <span className="badge bg-light text-dark">
                          ID: {qr.prescription._id?.slice(-6).toUpperCase() || 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    {/* Prescription Details */}
                    {qr.prescription && (
                      <div className="mb-3">
                        <div className="mb-2">
                          <strong>Disease:</strong> {qr.prescription.disease || 'N/A'}
                        </div>
                        <div className="mb-2">
                          <strong>Type:</strong>{' '}
                          <span className="badge bg-info text-dark">
                            {qr.prescription.diseaseType || 'General'}
                          </span>
                        </div>
                        {qr.doctor && (
                          <div className="mb-2">
                            <strong>Doctor:</strong> {qr.doctor.name || 'N/A'}
                          </div>
                        )}
                        {qr.prescription.date && (
                          <div className="mb-2">
                            <strong>Date:</strong>{' '}
                            {new Date(qr.prescription.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* QR Code Display */}
                    {qr.qrCode ? (
                      <div className="text-center mb-3">
                        <div className="border rounded p-3 bg-light mb-3">
                          <img 
                            src={qr.qrCode} 
                            alt="Prescription QR Code" 
                            className="img-fluid"
                            style={{ 
                              maxWidth: '200px', 
                              height: 'auto',
                              border: '2px solid #ddd',
                              borderRadius: '8px'
                            }}
                          />
                        </div>
                        <button
                          className="btn btn-primary btn-sm w-100"
                          onClick={() => handleDownload(qr.qrCode, qr.prescription?._id)}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            fill="currentColor" 
                            className="bi bi-download me-2" 
                            viewBox="0 0 16 16"
                          >
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5h2.9a.5.5 0 0 1 .5-.5c0-.3.2-.6.5-.6h3c.3 0 .5.3.5.6a.5.5 0 0 1 .5.5h2.9a.5.5 0 0 1 .5-.5v-6a.5.5 0 0 1 .5-.5h-13a.5.5 0 0 1-.5.5v6z"/>
                            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                          </svg>
                          Download QR Code
                        </button>
                      </div>
                    ) : (
                      <div className="alert alert-warning mb-3">
                        <small>
                          <strong>Note:</strong> QR code is not available. This may happen if all medication amounts have been entered by the pharmacist.
                        </small>
                      </div>
                    )}

                    {/* Medications with Intake Times */}
                    {qr.prescription?.medications && qr.prescription.medications.length > 0 && (
                      <div className="mt-3">
                        <strong className="small d-block mb-2">Medications & Intake Schedule:</strong>
                        <div className="list-group list-group-flush">
                          {qr.prescription.medications.map((med, idx) => (
                            <div key={idx} className="list-group-item px-0 py-2 border-bottom">
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <div>
                                  <strong className="small">{med.medicine?.medicineName || 'N/A'}</strong>
                                  <span className="badge bg-secondary ms-2">
                                    {med.medicine?.dosage || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-1">
                                <div className="d-flex flex-wrap gap-1 mb-1">
                                  {med.timing?.map((time, tIdx) => (
                                    <span 
                                      key={tIdx}
                                      className={`badge ${
                                        time === 'M' ? 'bg-warning text-dark' :
                                        time === 'A' ? 'bg-info text-dark' :
                                        'bg-dark'
                                      }`}
                                    >
                                      {time === 'M' ? '🌅 Morning' :
                                       time === 'A' ? '☀️ Afternoon' :
                                       '🌙 Night'}
                                    </span>
                                  ))}
                                </div>
                                <small className="text-muted">
                                  {getTimingDisplay(med.timing)}
                                </small>
                              </div>
                              {amountsEntered && med.amount && (
                                <div className="mt-1">
                                  <small className="text-success fw-semibold">
                                    Amount: ₹{med.amount.toFixed(2)}
                                  </small>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Total Amount if entered */}
                        {amountsEntered && totalAmount > 0 && (
                          <div className="mt-3 p-2 bg-light rounded">
                            <div className="d-flex justify-content-between align-items-center">
                              <strong>Total Amount:</strong>
                              <strong className="text-success">₹{totalAmount.toFixed(2)}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="card-footer bg-light text-muted small">
                    Generated: {qr.createdAt ? new Date(qr.createdAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PatientHome
