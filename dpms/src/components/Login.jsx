import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../config/api';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please enter username and password');
      return;
    }

    try {
      setLoading(true);

      // Call backend login API (no token needed for login)
      const response = await api.post('/auth/login', { username, password });

      const { token, user } = response.data;

      // Store token + user info in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Navigate to a dashboard based on role automatically
      navigate(`/${user.role}`);

      setLoading(false);
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      alert(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea, #764ba2)'
      }}
    >
      <div
        className="card p-4"
        style={{
          width: '380px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
      >
        <h3 className="text-center mb-1 fw-bold">Welcome Back</h3>
        <p className="text-center text-muted mb-4">Please login to continue</p>

        {/* Username */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Username</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {/* Login Button */}
        <button
          className="btn btn-dark w-100 mt-3"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Footer */}
        <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: '13px' }}>
          © 2025 Healthcare System
        </p>
      </div>
    </div>
  );
}

export default Login;
