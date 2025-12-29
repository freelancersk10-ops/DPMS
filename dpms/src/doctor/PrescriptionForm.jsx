import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../config/api'

function PrescriptionForm({ onSuccess }) {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [medicineList, setMedicineList] = useState([])

  const [patient, setPatient] = useState('')
  const [disease, setDisease] = useState('')
  const [type, setType] = useState('General')
  const [days, setDays] = useState('')

  const [medicines, setMedicines] = useState([
    { medicine: '', morning: false, afternoon: false, night: false }
  ])

  // Store created prescription ID and QR code
  const [createdPrescriptionId, setCreatedPrescriptionId] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [saving, setSaving] = useState(false)

  /* -----------------------------
     Fetch patients & medicines
  ----------------------------- */
  useEffect(() => {
    fetchPatients()
    fetchMedicines()
  }, [])

  const fetchPatients = async () => {
    try {
      const res = await api.get('/users/role/patient')
      setPatients(Array.isArray(res.data) ? res.data : res.data.users)
    } catch (err) {
      console.error('Error fetching patients:', err)
      setPatients([])
    }
  }

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medications')
      setMedicineList(res.data)
    } catch (err) {
      console.error('Error fetching medicines:', err)
      setMedicineList([])
    }
  }

  /* -----------------------------
     Medicine handlers
  ----------------------------- */
  const addMedicineLine = () => {
    setMedicines([
      ...medicines,
      { medicine: '', morning: false, afternoon: false, night: false }
    ])
  }

  const removeMedicineLine = (index) => {
    const updated = [...medicines]
    updated.splice(index, 1)
    setMedicines(updated)
  }

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines]
    updated[index][field] = value
    setMedicines(updated)
  }

  /* -----------------------------
     Submit
  ----------------------------- */
  const handleSubmit = async () => {
    try {
      setErrorMessage('')
      setSuccessMessage('')

      if (!patient || !disease) {
        setErrorMessage('Please select a patient and enter disease')
        return
      }

      // Prepare medications array
      const medicationsPayload = medicines.map(med => {
        const timing = []
        if (med.morning) timing.push('M')
        if (med.afternoon) timing.push('A')
        if (med.night) timing.push('N')

        if (!med.medicine) throw new Error('Select medicine for all rows')
        if (timing.length === 0) throw new Error('Select at least one timing per medicine')

        return { medicine: med.medicine, timing }
      })

      setSaving(true)

      const payload = {
        patient,
        disease,
        diseaseType: type,
        date: new Date(),
        medications: medicationsPayload
      }

      const response = await api.post('/prescriptions', payload)
      
      // Store the created prescription ID
      // Response structure: { message: "...", prescription: { _id: "...", ... } }
      console.log('Prescription response:', response.data)
      
      let prescriptionId = null
      if (response.data.prescription) {
        prescriptionId = response.data.prescription._id || response.data.prescription.id
      } else if (response.data._id) {
        prescriptionId = response.data._id
      }
      
      if (prescriptionId) {
        setCreatedPrescriptionId(prescriptionId)
        setQrCode(null) // Reset QR code
        // Don't show success message here - only show after QR generation
        setSuccessMessage('') // Clear any previous messages
      } else {
        console.error('Prescription ID not found in response:', response.data)
        setErrorMessage('Prescription saved but ID not found. Please check console for details.')
      }

      // Keep form data - DO NOT reset form fields
      // User can see what was saved and generate QR code
      // Don't call onSuccess to prevent redirect
    } catch (err) {
      console.error(err)
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to save prescription')
      setSaving(false)
    } finally {
      setSaving(false)
    }
  }

  /* -----------------------------
     Generate QR Code
  ----------------------------- */
  const handleGenerateQR = async () => {
    if (!createdPrescriptionId) {
      setErrorMessage('Please save the prescription first')
      return
    }

    try {
      setQrLoading(true)
      setErrorMessage('')
      setSuccessMessage('')

      const response = await api.post('/qr/generate', {
        prescriptionId: createdPrescriptionId
      })

      // QR code generated successfully - redirect to DoctorHome with success message
      if (response.data.qr?.qrCode || response.data.qr) {
        // Navigate to DoctorHome with success message in state
        navigate('/doctor', {
          state: {
            successMessage: 'Prescription saved and QR code generated successfully!'
          }
        })
      } else {
        setErrorMessage('QR code generated but could not be displayed')
        setQrLoading(false)
      }
    } catch (err) {
      console.error('Error generating QR:', err)
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already generated')) {
        // QR already exists - still redirect with success message
        navigate('/doctor', {
          state: {
            successMessage: 'Prescription saved and QR code already exists!'
          }
        })
      } else {
        setErrorMessage(err.response?.data?.message || 'Failed to generate QR code')
        setQrLoading(false)
      }
    }
  }

  /* -----------------------------
     Reset form completely
  ----------------------------- */
  const handleReset = () => {
    setCreatedPrescriptionId(null)
    setQrCode(null)
    setSuccessMessage('')
    setErrorMessage('')
    setPatient('')
    setDisease('')
    setType('General')
    setDays('')
    setMedicines([{ medicine: '', morning: false, afternoon: false, night: false }])
    setSaving(false)
    setQrLoading(false)
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white fw-semibold">
        Add New Prescription
      </div>

      <div className="card-body">

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

        {/* Error Message */}
        {errorMessage && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> {errorMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setErrorMessage('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Patient Details */}
        <h6 className="text-muted mb-3">Patient Details</h6>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Patient</label>
            <select
              className="form-select"
              value={patient}
              onChange={e => setPatient(e.target.value)}
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Disease</label>
            <input
              className="form-control"
              value={disease}
              onChange={e => setDisease(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Prescription Type</label>
            <select
              className="form-select"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option>General</option>
              <option>Long Time</option>
              <option>Chronic</option>
            </select>
          </div>
        </div>

        {/* Medicines */}
        <h6 className="text-muted mt-4 mb-3">Medicines</h6>
        {medicines.map((med, idx) => (
          <div key={idx} className="border rounded p-3 mb-3 bg-light">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">Medicine</label>
                <select
                  className="form-select"
                  value={med.medicine}
                  onChange={e => handleMedicineChange(idx, 'medicine', e.target.value)}
                >
                  <option value="">Select Medicine</option>
                  {medicineList.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.medicineName} ({m.dosage})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-5">
                <label className="form-label d-block">Schedule</label>
                {['morning', 'afternoon', 'night'].map(time => (
                  <div key={time} className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={med[time]}
                      onChange={e => handleMedicineChange(idx, time, e.target.checked)}
                    />
                    <label className="form-check-label text-capitalize">{time}</label>
                  </div>
                ))}
              </div>

              <div className="col-md-3 text-end">
                {medicines.length > 1 && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeMedicineLine(idx)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <button className="btn btn-outline-secondary mb-3" onClick={addMedicineLine}>
          + Add Medicine
        </button>

        {/* Duration */}
        <div className="mt-4 col-md-3">
          <label className="form-label fw-semibold">Duration (Days)</label>
          <input
            type="number"
            className="form-control"
            min="1"
            value={days}
            onChange={e => setDays(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
          <button 
            className="btn btn-success" 
            onClick={handleSubmit}
            disabled={saving}
            style={{ minWidth: '150px' }}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              'Save Prescription'
            )}
          </button>
          
          {createdPrescriptionId && (
            <button 
              className="btn btn-primary" 
              onClick={handleGenerateQR}
              disabled={qrLoading || !createdPrescriptionId}
              style={{ minWidth: '150px' }}
            >
              {qrLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Generating...
                </>
              ) : (
                'Generate QR Code'
              )}
            </button>
          )}
          
          {createdPrescriptionId && (
            <button 
              className="btn btn-outline-secondary" 
              onClick={handleReset}
            >
              Clear Form
            </button>
          )}
        </div>

        {/* Info message when prescription is saved but QR not generated yet */}
        {createdPrescriptionId && !qrCode && (
          <div className="alert alert-info mt-3 mb-0 d-flex align-items-center" role="alert">
            <span className="me-2">ℹ️</span>
            <div>
              <strong>Prescription saved!</strong> Prescription ID: <code>{createdPrescriptionId.slice(-6).toUpperCase()}</code>. 
              Form data preserved. Click <strong>"Generate QR Code"</strong> button above to create QR code.
            </div>
          </div>
        )}

        {/* QR Code Display */}
        {qrCode && (
          <div className="mt-4 p-3 border rounded bg-light">
            <h6 className="mb-3 fw-semibold">QR Code Generated</h6>
            <div className="text-center">
              <img 
                src={qrCode} 
                alt="Prescription QR Code" 
                className="img-fluid"
                style={{ maxWidth: '300px', border: '2px solid #ddd', borderRadius: '8px' }}
              />
              <p className="mt-2 text-muted small">
                Prescription ID: {createdPrescriptionId?.slice(-6).toUpperCase()}
              </p>
              <div className="mt-2">
                <a 
                  href={qrCode} 
                  download={`prescription-${createdPrescriptionId?.slice(-6)}.png`}
                  className="btn btn-sm btn-outline-primary"
                >
                  Download QR Code
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default PrescriptionForm
