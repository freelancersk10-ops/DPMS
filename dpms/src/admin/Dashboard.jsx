import { useEffect, useState } from 'react'
import api from '../config/api'

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPrescriptions: 0,
    totalMedications: 0,
    totalQRs: 0,
    usersByRole: {
      admin: 0,
      doctor: 0,
      patient: 0,
      pharmacist: 0
    },
    recentPrescriptions: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [emailConfig, setEmailConfig] = useState(null)
  const [testEmail, setTestEmail] = useState('')
  const [testEmailLoading, setTestEmailLoading] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState(null)

  useEffect(() => {
    fetchDashboardData()
    checkEmailConfig()
  }, [])

  const checkEmailConfig = async () => {
    try {
      const res = await api.get('/reminders/check-config')
      setEmailConfig(res.data)
    } catch (err) {
      console.error('Error checking email config:', err)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter an email address')
      return
    }

    try {
      setTestEmailLoading(true)
      setTestEmailResult(null)
      const res = await api.post('/reminders/test-email', { email: testEmail })
      setTestEmailResult({ success: true, message: res.data.message, result: res.data.result })
      setTestEmail('')
    } catch (err) {
      setTestEmailResult({ 
        success: false, 
        message: err.response?.data?.message || 'Failed to send test email',
        error: err.response?.data?.error,
        details: err.response?.data?.details
      })
    } finally {
      setTestEmailLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [usersRes, prescriptionsRes, medicationsRes, qrsRes] = await Promise.allSettled([
        api.get('/users'),
        api.get('/prescriptions'),
        api.get('/medications'),
        api.get('/qr')
      ])

      // Process users
      let totalUsers = 0
      const usersByRole = { admin: 0, doctor: 0, patient: 0, pharmacist: 0 }
      
      if (usersRes.status === 'fulfilled') {
        const users = Array.isArray(usersRes.value.data) ? usersRes.value.data : []
        totalUsers = users.length
        users.forEach(user => {
          if (user.role && usersByRole.hasOwnProperty(user.role)) {
            usersByRole[user.role]++
          }
        })
      }

      // Process prescriptions
      let totalPrescriptions = 0
      let recentPrescriptions = []
      
      if (prescriptionsRes.status === 'fulfilled') {
        const prescriptions = Array.isArray(prescriptionsRes.value.data) 
          ? prescriptionsRes.value.data 
          : []
        totalPrescriptions = prescriptions.length
        // Get 5 most recent prescriptions
        recentPrescriptions = prescriptions
          .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
          .slice(0, 5)
      }

      // Process medications
      let totalMedications = 0
      if (medicationsRes.status === 'fulfilled') {
        const medications = Array.isArray(medicationsRes.value.data) 
          ? medicationsRes.value.data 
          : []
        totalMedications = medications.length
      }

      // Process QR codes
      let totalQRs = 0
      if (qrsRes.status === 'fulfilled') {
        const qrs = Array.isArray(qrsRes.value.data) ? qrsRes.value.data : []
        totalQRs = qrs.length
      }

      setStats({
        totalUsers,
        totalPrescriptions,
        totalMedications,
        totalQRs,
        usersByRole,
        recentPrescriptions
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Loading dashboard data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error!</strong> {error}
        <button 
          type="button" 
          className="btn-close" 
          onClick={() => setError(null)}
          aria-label="Close"
        ></button>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'primary',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      link: '/admin/users'
    },
    {
      title: 'Prescriptions',
      value: stats.totalPrescriptions,
      icon: '📋',
      color: 'success',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      link: '/admin/prescriptions'
    },
    {
      title: 'Medications',
      value: stats.totalMedications,
      icon: '💊',
      color: 'warning',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      link: '/admin/medications'
    },
    {
      title: 'QR Codes',
      value: stats.totalQRs,
      icon: '📱',
      color: 'info',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      link: '#'
    }
  ]

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted">Welcome to the Digital Prescription Management System</p>
      </div>

      {/* Statistics Cards - Centered and Larger */}
      <div className="row g-4 mb-4 justify-content-center">
        {statCards.map((card, index) => (
          <div key={index} className="col-md-5 col-lg-3 col-xl-2">
            <div 
              className="card shadow-lg border-0 h-100 text-white"
              style={{ 
                background: card.gradient,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                minHeight: '180px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)'
              }}
              onClick={() => {
                if (card.link !== '#') {
                  window.location.href = card.link
                }
              }}
            >
              <div className="card-body p-5 d-flex flex-column justify-content-center align-items-center text-center">
                <div style={{ fontSize: '4rem', opacity: 0.4, marginBottom: '1rem' }}>
                  {card.icon}
                </div>
                <h2 className="fw-bold mb-2" style={{ fontSize: '3.5rem' }}>
                  {card.value}
                </h2>
                <h6 className="mb-0 opacity-90" style={{ fontSize: '1rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                  {card.title}
                </h6>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Role Breakdown & Recent Activity */}
      <div className="row g-4">
        {/* User Role Breakdown */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold">
                <span className="me-2">👥</span>
                Users by Role
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {Object.entries(stats.usersByRole).map(([role, count]) => {
                  const roleColors = {
                    admin: { bg: 'bg-primary', text: 'text-primary' },
                    doctor: { bg: 'bg-success', text: 'text-success' },
                    patient: { bg: 'bg-info', text: 'text-info' },
                    pharmacist: { bg: 'bg-warning', text: 'text-warning' }
                  }
                  const colors = roleColors[role] || { bg: 'bg-secondary', text: 'text-secondary' }
                  const percentage = stats.totalUsers > 0 
                    ? ((count / stats.totalUsers) * 100).toFixed(1) 
                    : 0

                  return (
                    <div key={role} className="col-6">
                      <div className="p-3 border rounded">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-capitalize fw-semibold">{role}</span>
                          <span className={`badge ${colors.bg} text-white`}>{count}</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className={`progress-bar ${colors.bg}`}
                            role="progressbar"
                            style={{ width: `${percentage}%` }}
                            aria-valuenow={percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <small className="text-muted">{percentage}%</small>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">
                <span className="me-2">📋</span>
                Recent Prescriptions
              </h5>
              <a href="/admin/prescriptions" className="btn btn-sm btn-outline-primary">
                View All
              </a>
            </div>
            <div className="card-body">
              {stats.recentPrescriptions.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p className="mb-0">No prescriptions yet</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {stats.recentPrescriptions.map((prescription, index) => (
                    <div 
                      key={prescription._id || index}
                      className="list-group-item px-0 py-3 border-bottom"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-semibold">
                            {prescription.disease || 'N/A'}
                          </h6>
                          <div className="d-flex gap-2 flex-wrap">
                            {prescription.patient?.name && (
                              <small className="text-muted">
                                <strong>Patient:</strong> {prescription.patient.name}
                              </small>
                            )}
                            {prescription.doctor?.name && (
                              <small className="text-muted">
                                <strong>Doctor:</strong> {prescription.doctor.name}
                              </small>
                            )}
                          </div>
                          {prescription.date && (
                            <small className="text-muted d-block mt-1">
                              {new Date(prescription.date).toLocaleDateString()}
                            </small>
                          )}
                        </div>
                        <span className={`badge ${
                          prescription.diseaseType === 'Chronic' ? 'bg-danger' :
                          prescription.diseaseType === 'Long Time' ? 'bg-warning' :
                          'bg-info'
                        } text-white`}>
                          {prescription.diseaseType || 'General'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row g-4 mt-2">
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center p-4">
              <div className="mb-2" style={{ fontSize: '2.5rem' }}>🏥</div>
              <h4 className="fw-bold mb-1">{stats.usersByRole.doctor}</h4>
              <p className="text-muted mb-0 small">Active Doctors</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center p-4">
              <div className="mb-2" style={{ fontSize: '2.5rem' }}>👤</div>
              <h4 className="fw-bold mb-1">{stats.usersByRole.patient}</h4>
              <p className="text-muted mb-0 small">Registered Patients</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center p-4">
              <div className="mb-2" style={{ fontSize: '2.5rem' }}>💉</div>
              <h4 className="fw-bold mb-1">{stats.usersByRole.pharmacist}</h4>
              <p className="text-muted mb-0 small">Pharmacists</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Configuration & Testing */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">
                <span className="me-2">📧</span>
                Email Configuration & Testing
              </h5>
              <button 
                className="btn btn-sm btn-light"
                onClick={checkEmailConfig}
              >
                Refresh Status
              </button>
            </div>
            <div className="card-body">
              {emailConfig && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">Configuration Status</h6>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="p-3 border rounded">
                        <div className="d-flex align-items-center mb-2">
                          <span className={`badge ${emailConfig.configured ? 'bg-success' : 'bg-danger'} me-2`}>
                            {emailConfig.configured ? '✓' : '✗'}
                          </span>
                          <strong>Configured</strong>
                        </div>
                        <small className="text-muted">
                          {emailConfig.configured ? 'Email service is configured' : 'Email service not configured'}
                        </small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 border rounded">
                        <strong className="d-block mb-1">SMTP Host</strong>
                        <small className="text-muted">{emailConfig.smtpHost}</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 border rounded">
                        <strong className="d-block mb-1">SMTP Port</strong>
                        <small className="text-muted">{emailConfig.smtpPort}</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 border rounded">
                        <strong className="d-block mb-1">Connection</strong>
                        <span className={`badge ${
                          emailConfig.connectionStatus === 'Connected' ? 'bg-success' : 
                          emailConfig.connectionStatus === 'Failed' ? 'bg-danger' : 
                          'bg-secondary'
                        }`}>
                          {emailConfig.connectionStatus || 'Not tested'}
                        </span>
                        {emailConfig.connectionError && (
                          <small className="text-danger d-block mt-1">{emailConfig.connectionError}</small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!emailConfig?.configured && (
                <div className="alert alert-warning">
                  <strong>⚠️ Email Not Configured</strong>
                  <p className="mb-0 mt-2">
                    To enable email reminders, please add the following to your <code>.env</code> file:
                  </p>
                  <pre className="bg-light p-2 mt-2 rounded" style={{ fontSize: '0.85rem' }}>
{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password`}
                  </pre>
                  <p className="mb-0 mt-2">
                    <strong>For Gmail:</strong> You need to generate an App Password (not your regular password).
                    Go to Google Account → Security → 2-Step Verification → App passwords
                  </p>
                </div>
              )}

              {emailConfig?.configured && (
                <div>
                  <h6 className="fw-bold mb-3">Test Email Sending</h6>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-8">
                      <label className="form-label">Test Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter email address to test"
                        value={testEmail}
                        onChange={e => setTestEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <button
                        className="btn btn-primary w-100"
                        onClick={handleTestEmail}
                        disabled={testEmailLoading || !testEmail}
                      >
                        {testEmailLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Sending...
                          </>
                        ) : (
                          'Send Test Email'
                        )}
                      </button>
                    </div>
                  </div>

                  {testEmailResult && (
                    <div className={`alert ${testEmailResult.success ? 'alert-success' : 'alert-danger'} mt-3`}>
                      <strong>{testEmailResult.success ? '✓ Success!' : '✗ Failed'}</strong>
                      <p className="mb-1 mt-2">{testEmailResult.message}</p>
                      {testEmailResult.error && (
                        <p className="mb-1"><strong>Error:</strong> {testEmailResult.error}</p>
                      )}
                      {testEmailResult.details && (
                        <p className="mb-0"><small>{testEmailResult.details}</small></p>
                      )}
                      {testEmailResult.result && (
                        <p className="mb-0 mt-2">
                          <small>
                            <strong>Message ID:</strong> {testEmailResult.result.messageId}<br/>
                            <strong>Sent to:</strong> {testEmailResult.result.to}
                          </small>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
