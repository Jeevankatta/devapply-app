import React, { useState, useEffect } from 'react'
import { getAllUsers } from '../services/api'
import './UsersList.css'

function UsersList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await getAllUsers()
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="users-loading">Loading users...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="users-list">
      <h2>Registered Users ({users.length})</h2>
      {users.length === 0 ? (
        <p>No users registered yet.</p>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Resume</th>
                <th>Telegram</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.has_resume ? '✅ Yes' : '❌ No'}</td>
                  <td>{user.telegram_chat_id || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UsersList
