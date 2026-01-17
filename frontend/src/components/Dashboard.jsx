import React, { useState, useEffect } from 'react'
import { getJobs, getStats, getSchedulerStatus, stopScheduler, startScheduler, runSchedulerNow } from '../services/api'
import './Dashboard.css'

function Dashboard({ token, userName, onLogout }) {
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState(null)
  const [schedulerStatus, setSchedulerStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadData()
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [token])

  const loadData = async () => {
    try {
      setError('')
      const [jobsData, statsData, statusData] = await Promise.all([
        getJobs(token),
        getStats(token),
        getSchedulerStatus(),
      ])
      setJobs(jobsData.jobs || [])
      setStats(statsData)
      setSchedulerStatus(statusData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStopScheduler = async () => {
    setActionLoading(true)
    try {
      await stopScheduler()
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleStartScheduler = async () => {
    setActionLoading(true)
    try {
      await startScheduler()
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRunNow = async () => {
    setActionLoading(true)
    try {
      await runSchedulerNow()
      alert('Job scraping started! Check back in a few moments.')
      setTimeout(loadData, 5000) // Reload after 5 seconds
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Section */}
      {stats && (
        <div className="stats-section">
          <h3>Your Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total_jobs}</div>
              <div className="stat-label">Total Jobs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.saved_jobs}</div>
              <div className="stat-label">Saved Jobs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.keywords}</div>
              <div className="stat-label">Keywords</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.location}</div>
              <div className="stat-label">Location</div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduler Control */}
      {schedulerStatus && (
        <div className="scheduler-section">
          <h3>Automation Control</h3>
          <div className="scheduler-info">
            <div className="scheduler-status">
              <span className={`status-indicator ${schedulerStatus.running ? 'running' : 'stopped'}`}>
                {schedulerStatus.running ? '🟢 Running' : '🔴 Stopped'}
              </span>
              <p>
                Scheduled to run daily at 8:00 AM
                {schedulerStatus.jobs[0]?.next_run_time && (
                  <span> (Next: {new Date(schedulerStatus.jobs[0].next_run_time).toLocaleString()})</span>
                )}
              </p>
            </div>
            <div className="scheduler-actions">
              {schedulerStatus.running ? (
                <button 
                  className="btn-stop" 
                  onClick={handleStopScheduler}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Stopping...' : 'Stop Scheduler'}
                </button>
              ) : (
                <button 
                  className="btn-start" 
                  onClick={handleStartScheduler}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Starting...' : 'Start Scheduler'}
                </button>
              )}
              <button 
                className="btn-run-now" 
                onClick={handleRunNow}
                disabled={actionLoading}
              >
                {actionLoading ? 'Running...' : 'Run Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="jobs-section">
        <h3>Your Saved Jobs ({jobs.length})</h3>
        {jobs.length === 0 ? (
          <div className="no-jobs">
            <p>No jobs found yet. The scheduler will automatically find jobs for you!</p>
            <p>Click "Run Now" above to start searching immediately.</p>
          </div>
        ) : (
          <div className="jobs-list">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h4>{job.title}</h4>
                  <span className={`job-status ${job.status.toLowerCase()}`}>{job.status}</span>
                </div>
                <div className="job-details">
                  <p className="job-company">🏢 {job.company}</p>
                  <p className="job-platform">📱 {job.platform}</p>
                  {job.applied_on && (
                    <p className="job-date">📅 {new Date(job.applied_on).toLocaleDateString()}</p>
                  )}
                </div>
                <a 
                  href={job.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="job-link"
                >
                  View Job →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
