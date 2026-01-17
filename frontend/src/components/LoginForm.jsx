import React, { useState } from 'react'
import { loginUser } from '../services/api'
import './LoginForm.css'

function LoginForm({ onSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const data = await loginUser(email, password)
      onSuccess(data)
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-form">
      <h2>Welcome Back</h2>
      <p className="subtitle">Login to your job search account</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder="your@email.com"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Enter your password"
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="switch-form">
        Don't have an account?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToRegister}>
          Register here
        </button>
      </p>
    </div>
  )
}

export default LoginForm
