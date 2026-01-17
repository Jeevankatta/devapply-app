import axios from 'axios'

// Auto-detect API URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.origin.includes('localhost')) 
    ? 'http://localhost:8000'
    : window.location.origin.replace(/:\d+/, '').replace(/frontend/, 'backend')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const registerUser = async (name, email, password) => {
  try {
    const response = await api.post('/register', {
      name,
      email,
      password,
    })
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message || 'Registration failed'
    throw new Error(errorMessage)
  }
}

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login', {
      email,
      password,
    })
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message || 'Login failed'
    throw new Error(errorMessage)
  }
}

export const getAllUsers = async () => {
  try {
    const response = await api.get('/users')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch users')
  }
}

export const uploadResume = async (token, file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/upload_resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Upload failed')
  }
}

export const checkHealth = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    throw new Error('Backend is not available')
  }
}

// New endpoints for scheduler and jobs
export const getJobs = async (token, limit = 50) => {
  try {
    const response = await api.get('/jobs', {
      params: { limit },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch jobs')
  }
}

export const getStats = async (token) => {
  try {
    const response = await api.get('/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch stats')
  }
}

export const getSchedulerStatus = async () => {
  try {
    const response = await api.get('/scheduler/status')
    return response.data
  } catch (error) {
    throw new Error('Failed to get scheduler status')
  }
}

export const stopScheduler = async () => {
  try {
    const response = await api.post('/scheduler/stop')
    return response.data
  } catch (error) {
    throw new Error('Failed to stop scheduler')
  }
}

export const startScheduler = async () => {
  try {
    const response = await api.post('/scheduler/start')
    return response.data
  } catch (error) {
    throw new Error('Failed to start scheduler')
  }
}

export const runSchedulerNow = async () => {
  try {
    const response = await api.post('/scheduler/run-now')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to run scheduler')
  }
}

export default api
