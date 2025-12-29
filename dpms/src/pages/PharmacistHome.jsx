import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../config/api'
import jsQR from 'jsqr'

function PharmacistHome() {
  const navigate = useNavigate()
  const [pendingPrescriptions, setPendingPrescriptions] = useState([])
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [qrFile, setQrFile] = useState(null)
  const [showTable, setShowTable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scanMode, setScanMode] = useState('upload') // 'upload' or 'camera'
  const [cameraActive, setCameraActive] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const scanIntervalRef = useRef(null)

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  useEffect(() => {
    fetchPendingPrescriptions()
    return () => {
      // Cleanup camera stream on unmount
      stopCamera()
    }
  }, [])

  const fetchPendingPrescriptions = async () => {
    try {
      setLoading(true)
      const res = await api.get('/pharmacist/pending')
      setPendingPrescriptions(res.data)
    } catch (err) {
      console.error('Error fetching pending prescriptions:', err)
      setError('Failed to fetch pending prescriptions')
    } finally {
      setLoading(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setCameraActive(false)
  }

  const startCamera = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
        
        // Start scanning for QR codes
        scanIntervalRef.current = setInterval(() => {
          scanQRFromCamera()
        }, 500) // Scan every 500ms
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please check permissions.')
    }
  }

  const scanQRFromCamera = () => {
    if (!videoRef.current || !cameraActive) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        try {
          const qrData = JSON.parse(code.data)
          processQRData(qrData)
          stopCamera() // Stop camera after successful scan
        } catch (err) {
          console.error('Error parsing QR data:', err)
        }
      }
    }
  }

  const handleFileChange = (file) => {
    if (file) {
      setQrFile(URL.createObjectURL(file))
      setError('')
    } else {
      setQrFile(null)
    }
  }

  const scanUploadedQR = () => {
    if (!qrFile) {
      setError('Please upload QR Code first')
      return
    }

    try {
      const img = new Image()
      img.src = qrFile
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (code) {
          try {
            const qrData = JSON.parse(code.data)
            processQRData(qrData)
          } catch (err) {
            setError('Invalid QR code format')
          }
        } else {
          setError('Could not read QR code from image')
        }
      }
      img.onerror = () => {
        setError('Error loading image')
      }
    } catch (err) {
      setError('Error scanning QR code')
    }
  }

  const processQRData = (qrData) => {
    try {
      // Find prescription by ID from QR data
      const matched = pendingPrescriptions.find(
        p => p._id === qrData.prescriptionId || p._id.toString() === qrData.prescriptionId
      )

      if (matched) {
        // Store days from QR data if available
        if (qrData.days) {
          matched.days = qrData.days
        }
        setSelectedPrescription(matched)
        setShowTable(true)
        setError('')
        setSuccess('Prescription scanned successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        // If not in pending list, try to fetch by ID
        fetchPrescriptionById(qrData.prescriptionId, qrData.days)
      }
    } catch (err) {
      setError('Error processing QR data: ' + err.message)
    }
  }

  const fetchPrescriptionById = async (prescriptionId, days) => {
    try {
      const res = await api.get(`/prescriptions/${prescriptionId}`)
      if (res.data) {
        if (days) {
          res.data.days = days
        }
        setSelectedPrescription(res.data)
        setShowTable(true)
        setError('')
        setSuccess('Prescription scanned successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Prescription not found or already processed')
      }
    } catch (err) {
      setError('Prescription not found or already processed')
    }
  }

  const handleAmountChange = (index, value) => {
    if (!selectedPrescription) return
    const updated = [...selectedPrescription.medications]
    updated[index].amount = value ? Number(value) : null
    setSelectedPrescription({ ...selectedPrescription, medications: updated })
  }

  const updatePrescription = async () => {
    if (!selectedPrescription) return

    // Validate all amounts are entered
    const hasEmptyAmounts = selectedPrescription.medications.some(
      med => !med.amount || med.amount === 0
    )

    if (hasEmptyAmounts) {
      setError('Please enter amount for all medications')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const payload = {
        prescriptionId: selectedPrescription._id,
        medications: selectedPrescription.medications.map(med => ({
          _id: med._id,
          medicine: med.medicine?._id || med.medicine,
          amount: Number(med.amount)
        }))
      }

      await api.put('/pharmacist/enter-amount', payload)
      
      setSuccess('Prescription updated successfully! QR code will be hidden from patient.')
      setTimeout(() => {
        setSuccess('')
        fetchPendingPrescriptions() // Refresh list
        setShowTable(false)
        setSelectedPrescription(null)
        setQrFile(null)
      }, 2000)
    } catch (err) {
      console.error('Error updating prescription:', err)
      setError(err.response?.data?.message || 'Failed to update prescription')
    } finally {
      setLoading(false)
    }
  }

  const getTimingDisplay = (timing) => {
    if (!timing || !Array.isArray(timing)) return 'N/A'
    const timingMap = { M: 'Morning', A: 'Afternoon', N: 'Night' }
    return timing.map(t => timingMap[t] || t).join(', ')
  }

  const totalAmount = selectedPrescription?.medications?.reduce(
    (sum, med) => sum + (Number(med.amount) || 0),
    0
  ) || 0

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Pharmacist Dashboard</h3>
          <small className="text-muted">
            Scan QR code and enter medication amounts
          </small>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-success p-2">
            Pending: {pendingPrescriptions.length}
          </span>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success!</strong> {success}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccess('')}
            aria-label="Close"
          ></button>
        </div>
      )}

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

      {/* QR Scan/Upload Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white fw-semibold">
          Scan or Upload Prescription QR Code
        </div>
        <div className="card-body">
          {/* Mode Selection */}
          <div className="btn-group w-100 mb-3" role="group">
            <input
              type="radio"
              className="btn-check"
              name="scanMode"
              id="uploadMode"
              checked={scanMode === 'upload'}
              onChange={() => {
                setScanMode('upload')
                stopCamera()
              }}
            />
            <label className="btn btn-outline-primary" htmlFor="uploadMode">
              📁 Upload QR Code
            </label>

            <input
              type="radio"
              className="btn-check"
              name="scanMode"
              id="cameraMode"
              checked={scanMode === 'camera'}
              onChange={() => {
                setScanMode('camera')
                setQrFile(null)
              }}
            />
            <label className="btn btn-outline-primary" htmlFor="cameraMode">
              📷 Scan with Camera
            </label>
          </div>

          {/* Upload Mode */}
          {scanMode === 'upload' && (
            <div className="row align-items-center">
              <div className="col-md-8">
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={e => handleFileChange(e.target.files[0])}
                />
                {qrFile && (
                  <small className="text-muted mt-1 d-block">
                    File selected. Click "Scan QR Code" to extract prescription details.
                  </small>
                )}
              </div>
              <div className="col-md-4 text-end">
                <button
                  className="btn btn-dark w-100"
                  onClick={scanUploadedQR}
                  disabled={!qrFile}
                >
                  Scan QR Code
                </button>
              </div>
            </div>
          )}

          {/* Camera Mode */}
          {scanMode === 'camera' && (
            <div>
              {!cameraActive ? (
                <button
                  className="btn btn-success w-100"
                  onClick={startCamera}
                >
                  📷 Start Camera Scan
                </button>
              ) : (
                <div>
                  <div className="position-relative mb-3" style={{ maxWidth: '100%', margin: '0 auto' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{ width: '100%', maxWidth: '500px', borderRadius: '8px' }}
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                      <div 
                        style={{
                          border: '2px solid #0d6efd',
                          borderRadius: '8px',
                          width: '250px',
                          height: '250px',
                          pointerEvents: 'none'
                        }}
                      />
                    </div>
                  </div>
                  <button
                    className="btn btn-danger w-100"
                    onClick={stopCamera}
                  >
                    Stop Camera
                  </button>
                  <small className="text-muted d-block mt-2 text-center">
                    Position QR code within the frame
                  </small>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Medications Table */}
      {showTable && selectedPrescription && (
        <div className="card shadow-sm">
          <div className="card-header bg-success text-white fw-semibold">
            <div className="d-flex justify-content-between align-items-center">
              <span>Medications & Intake Schedule</span>
              {selectedPrescription.days && (
                <span className="badge bg-light text-dark fs-6">
                  Total Days: {selectedPrescription.days} days
                </span>
              )}
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '30%' }}>Medicine Name</th>
                  <th style={{ width: '20%' }}>Dosage</th>
                  <th style={{ width: '30%' }}>Intake Times</th>
                  <th style={{ width: '20%' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {selectedPrescription.medications.map((med, idx) => (
                  <tr key={idx}>
                    <td className="fw-semibold">
                      {med.medicine?.medicineName || 'N/A'}
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {med.medicine?.dosage || 'N/A'}
                      </span>
                    </td>
                    <td>
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
                    </td>
                    <td>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter amount"
                          min="0"
                          step="0.01"
                          value={med.amount || ''}
                          onChange={e => handleAmountChange(idx, e.target.value)}
                          required
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="table-light">
                  <td colSpan="3" className="text-end fw-bold fs-5">
                    Total Amount:
                  </td>
                  <td className="fw-bold fs-5 text-success">
                    ₹ {totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {selectedPrescription.days && (
                  <small className="text-muted d-block">
                    <strong>Prescription Duration:</strong> {selectedPrescription.days} days
                  </small>
                )}
                <small className="text-muted">
                  * Once amounts are entered, QR code will be hidden from patient
                </small>
              </div>
              <button
                className="btn btn-success px-4"
                onClick={updatePrescription}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Updating...
                  </>
                ) : (
                  'Update & Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !showTable && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PharmacistHome
