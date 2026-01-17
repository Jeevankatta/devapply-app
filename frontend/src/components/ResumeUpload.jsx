import React, { useState, useRef } from 'react'
import { uploadResume } from '../services/api'
import './ResumeUpload.css'

function ResumeUpload({ token, onLogout, onComplete }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Check file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or Word document')
        return
      }

      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      setFile(selectedFile)
      setError('')
      setSuccess(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a file')
      return
    }

    if (!token) {
      setError('Authentication token is missing. Please login again.')
      return
    }

    setError('')
    setLoading(true)
    setSuccess(false)

    try {
      await uploadResume(token, file)
      setSuccess(true)
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      // Auto-redirect to dashboard after 2 seconds
      setTimeout(() => {
        if (onComplete) onComplete()
      }, 2000)
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const event = {
        target: {
          files: [droppedFile],
        },
      }
      handleFileChange(event)
    }
  }

  return (
    <div className="resume-upload">
      <div className="header-section">
        <h2>Upload Your Resume</h2>
        <p className="subtitle">Upload your resume to get started with automated job applications</p>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className="file-drop-zone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          {file ? (
            <div className="file-selected">
              <span className="file-icon">📄</span>
              <div className="file-info">
                <p className="file-name">{file.name}</p>
                <p className="file-size">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                type="button"
                className="remove-file"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <div className="file-placeholder">
              <span className="upload-icon">📤</span>
              <p className="upload-text">
                Click to select or drag and drop your resume
              </p>
              <p className="upload-hint">PDF or Word document (max 5MB)</p>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        
        {success && (
          <div className="success-message">
            ✅ Resume uploaded successfully! Your job applications will be automated.
          </div>
        )}

        <button
          type="submit"
          className="upload-btn"
          disabled={loading || !file}
        >
          {loading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </form>

      <div className="info-box">
        <h3>What happens next?</h3>
        <ul>
          <li>Your resume will be stored securely</li>
          <li>DevApply will automatically find relevant jobs</li>
          <li>You'll receive daily updates via email</li>
          <li>Jobs will be saved and ready for application</li>
        </ul>
      </div>
    </div>
  )
}

export default ResumeUpload
