import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Hard-coded credentials as requested
  const adminCredentials = {
    username: 'Tourmyholiday#to@my$ho',
    password: 'Apple@123#shreya'
  };

  // Check for saved credentials when component mounts
  useEffect(() => {
    const savedUsername = localStorage.getItem('adminUsername');
    if (savedUsername) {  
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
      // Set auth token in localStorage
      localStorage.setItem('adminAuth', 'true');
      
      // If Remember Me is checked, save the username
      if (rememberMe) {
        localStorage.setItem('adminUsername', username);
      } else {
        localStorage.removeItem('adminUsername');
      }
      
      // Redirect to dashboard
      navigate('/admin-dashboard');
    } else {
      setError('Recheck UserName And Password');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>Admin Dashboard</h1>
          <p>Enter your credentials to access the dashboard</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <div className="form-group remember-me">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              Remember me
            </label>
          </div>
          
          <button type="submit" className="login-btn">Sign In</button>
        </form>
        
        <div className="admin-login-footer">
          <p>Access restricted to authorized personnel only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 