import { useEffect, useState } from 'react'
import api from '../config/api'

function Users() {
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    role: 'doctor',
    username: '',
    password: '',
    mobile: '',
    email: '',
    gender: ''
  })
  const [loading, setLoading] = useState(false)

  // -----------------------------
  // Fetch all users (excluding admin)
  // -----------------------------
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users')
      // Filter out admin users - display only doctors, patients, and pharmacists
      const filteredUsers = Array.isArray(res.data) 
        ? res.data.filter(user => user.role !== 'admin')
        : []
      setUsers(filteredUsers)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // -----------------------------
  // Handle Add User
  // -----------------------------
  const handleAddUser = async () => {
    try {
      setLoading(true)
      await api.post('/auth/register', formData)

      await fetchUsers()

      document.getElementById('addUserClose').click()

      setFormData({
        name: '',
        age: '',
        role: 'doctor',
        username: '',
        password: '',
        mobile: '',
        email: '',
        gender: ''
      })
    } catch (err) {
      console.error('Error adding user:', err)
      alert(err.response?.data?.message || 'Failed to add user')
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
  // Handle delete
  // -----------------------------
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      await api.delete(`/users/${id}`)
      fetchUsers()
    } catch (err) {
      console.error('Error deleting user:', err)
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">User Management</h3>
          <small className="text-muted">Manage doctors, patients & pharmacists</small>
        </div>
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUser">
          + Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="card shadow-sm">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Role</th>
                <th>Mobile</th>
                <th>Email</th>
                <th style={{ width: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u._id}>
                    <td className="fw-semibold">{u.name}</td>
                    <td>{u.age || '-'}</td>
                    <td>
                      <span className="badge bg-info text-dark">{u.role}</span>
                    </td>
                    <td>{u.mobile || '-'}</td>
                    <td>{u.email || '-'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(u._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* Add User Modal */}
      <div className="modal fade" id="addUser" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title fw-bold">Add New User</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" id="addUserClose"></button>
            </div>

            <div className="modal-body">
              <div className="row g-3">

                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    placeholder="Full name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Age</label>
                  <input
                    className="form-control"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                     <option value="doctor">Doctor</option>
  <option value="patient">Patient</option>
  <option value="pharmacist">Pharmacist</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Username</label>
                  <input
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Mobile</label>
                  <input
                    className="form-control"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label d-block">Gender</label>
                  {['Male','Female','Others'].map(g => (
                    <div className="form-check form-check-inline" key={g}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">{g}</label>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button
                className="btn btn-success"
                onClick={handleAddUser}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save User'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default Users
