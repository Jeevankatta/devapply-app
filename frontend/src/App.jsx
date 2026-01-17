import React, { useState, useEffect } from 'react'
import RegisterForm from './components/RegisterForm'
import LoginForm from './components/LoginForm'
import ResumeUpload from './components/ResumeUpload'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [userData, setUserData] = useState(null)
  const [step, setStep] = useState('login') // 'login', 'register', 'upload', or 'dashboard'

  // Check for existing JWT token on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userId = localStorage.getItem('user_id')
    const userName = localStorage.getItem('user_name')
    if (token && userId) {
      setUserData({ 
        access_token: token, 
        user_id: parseInt(userId),
        name: userName 
      })
      setStep('dashboard')
    }
  }, [])

  const handleLoginSuccess = (data) => {
    setUserData(data)
    // Store in localStorage
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user_id', data.user_id.toString())
    localStorage.setItem('user_name', data.name)
    setStep('dashboard')
  }

  const handleRegisterSuccess = (data) => {
    setUserData(data)
    setStep('upload')
    // Store in localStorage
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user_id', data.user_id.toString())
    localStorage.setItem('user_name', data.name)
  }

  const handleUploadComplete = () => {
    setStep('dashboard')
  }

  const handleLogout = () => {
    setUserData(null)
    setStep('login')
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_name')
  }

  const switchToRegister = () => {
    setStep('register')
  }

  const switchToLogin = () => {
    setStep('login')
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🚀 DevApply</h1>
          <p>Automated Job Application Assistant</p>
          {userData && <p className="user-greeting">Welcome, {userData.name}!</p>}
        </header>

        {step === 'login' ? (
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={switchToRegister}
          />
        ) : step === 'register' ? (
          <RegisterForm 
            onSuccess={handleRegisterSuccess}
            onSwitchToLogin={switchToLogin}
          />
        ) : step === 'upload' ? (
          <ResumeUpload 
            token={userData?.access_token} 
            onLogout={handleLogout}
            onComplete={handleUploadComplete}
          />
        ) : (
          <Dashboard 
            token={userData?.access_token}
            userName={userData?.name}
            onLogout={handleLogout}
          />
        )}

        <footer className="footer">
          <p>Let DevApply handle your job applications automatically</p>
        </footer>
      </div>
    </div>
  )
}

export default App
