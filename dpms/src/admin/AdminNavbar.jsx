import { Link, useNavigate } from 'react-router-dom'

function AdminNavbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Clear auth data if needed
    localStorage.clear()
    navigate('/') // Go to Login page
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4 shadow-sm" style={{ backgroundColor: '#1e3a8a' }}>
      <div className="container-fluid">
        {/* Brand */}
        <span className="navbar-brand fw-bold fs-4 d-flex align-items-center">
          <span className="me-2">🏥</span>
          Admin Dashboard
        </span>

        {/* Hamburger for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbarNav"
          aria-controls="adminNavbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav links */}
        <div className="collapse navbar-collapse" id="adminNavbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-3">
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/admin">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/admin/users">
                Users
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/admin/medications">
                Medications
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/admin/prescriptions">
                Prescriptions
              </Link>
            </li>
          </ul>

          {/* Logout button on the right */}
          <div className="d-flex ms-auto">
            <button
              className="btn btn-outline-light fw-semibold"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar
