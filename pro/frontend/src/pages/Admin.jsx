import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import MacWindow from '../components/MacWindow'
import Dock from '../components/Dock'
import './Admin.css'

export default function Admin({ toggleTheme, theme }) {
  const { user } = useAuth()
  
  // Personal playlist state (all users)
  const [personalPlaylistUrl, setPersonalPlaylistUrl] = useState('')
  const [personalLoading, setPersonalLoading] = useState(false)
  
  // Public playlist state (admin only)
  const [publicPlaylistUrl, setPublicPlaylistUrl] = useState('')
  const [publicLoading, setPublicLoading] = useState(false)
  
  // Shared state
  const [message, setMessage] = useState({ type: '', text: '' })
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [deletingCourseId, setDeletingCourseId] = useState(null)

  // Fetch all courses on mount
  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true)
      const response = await axios.get('/api/courses?limit=100')
      console.log('Fetched courses:', response.data.courses) // Debug log
      setCourses(response.data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      setMessage({ type: 'error', text: 'Failed to load courses' })
    } finally {
      setLoadingCourses(false)
    }
  }

  // Handle personal playlist import (all users)
  const handlePersonalImport = async (e) => {
    e.preventDefault()
    if (!personalPlaylistUrl.trim()) {
      setMessage({ type: 'error', text: 'Please enter a playlist URL' })
      return
    }

    setPersonalLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await axios.post('/api/ingest/playlist', {
        playlistUrl: personalPlaylistUrl.trim(),
        isPersonal: true
      })
      setMessage({
        type: 'success',
        text: `✅ Successfully added "${response.data.course.title}" with ${response.data.course.lessonCount} lessons to YOUR courses! Scroll down to see it with ⭐ badge.`
      })
      setPersonalPlaylistUrl('')
      // Immediately refresh courses list
      await fetchCourses()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to import playlist'
      })
    } finally {
      setPersonalLoading(false)
    }
  }

  // Handle public playlist import (admin only)
  const handlePublicImport = async (e) => {
    e.preventDefault()
    if (!publicPlaylistUrl.trim()) {
      setMessage({ type: 'error', text: 'Please enter a playlist URL' })
      return
    }

    setPublicLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await axios.post('/api/ingest/playlist', {
        playlistUrl: publicPlaylistUrl.trim(),
        isPersonal: false
      })
      setMessage({
        type: 'success',
        text: `✅ Successfully added PUBLIC playlist "${response.data.course.title}" with ${response.data.course.lessonCount} lessons! All users can see it with 🌐 badge.`
      })
      setPublicPlaylistUrl('')
      // Immediately refresh courses list
      await fetchCourses()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to import playlist'
      })
    } finally {
      setPublicLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingCourseId(courseId)
      const response = await axios.delete(`/api/courses/${courseId}`)
      setMessage({
        type: 'success',
        text: `Successfully deleted "${courseTitle}" and ${response.data.course.lessonsDeleted} lessons`
      })
      // Remove from local state
      setCourses(courses.filter(c => c._id !== courseId))
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to delete course'
      })
    } finally {
      setDeletingCourseId(null)
    }
  }

  return (
    <div className="admin-page">
      <MacWindow title={user?.role === 'admin' ? 'Admin Panel' : 'My Courses'} className="admin-window">
        <div className="admin-content">
          
          {/* Admin Section - PUBLIC PLAYLISTS (Admin Only) */}
          {user?.role === 'admin' && (
            <section className="admin-section admin-only-section">
              <h1>🌐 Add Public Playlist (Admin Only)</h1>
              <p className="admin-subtitle">
                Import a YouTube playlist that ALL USERS can see and access
              </p>

              <form onSubmit={handlePublicImport} className="import-form">
                <div className="form-group">
                  <label htmlFor="publicPlaylistUrl">Playlist URL</label>
                  <input
                    id="publicPlaylistUrl"
                    type="url"
                    value={publicPlaylistUrl}
                    onChange={(e) => setPublicPlaylistUrl(e.target.value)}
                    placeholder="https://www.youtube.com/playlist?list=..."
                    required
                  />
                </div>

                {message.text && (
                  <div className={`message ${message.type}`}>
                    {message.text}
                  </div>
                )}

                <button type="submit" className="btn-primary btn-admin" disabled={publicLoading}>
                  {publicLoading ? '⏳ Adding...' : '🌐 Add Public Playlist'}
                </button>
              </form>

              <div className="admin-info public-info">
                <h3>🌐 Public Playlist:</h3>
                <ul>
                  <li>✓ Visible to ALL users</li>
                  <li>✓ Appears on everyone's home page</li>
                  <li>✓ Shows 🌐 badge</li>
                  <li>✓ Only admins can delete</li>
                </ul>
              </div>
            </section>
          )}

          {/* Personal Playlist Section - PRIVATE (All Users) */}
          <section className="admin-section">
            <h1>⭐ Add Your Personal Playlist</h1>
            <p className="admin-subtitle">
              Import any YouTube playlist - it will be PRIVATE and visible only to you
            </p>

            <form onSubmit={handlePersonalImport} className="import-form">
              <div className="form-group">
                <label htmlFor="personalPlaylistUrl">Playlist URL</label>
                <input
                  id="personalPlaylistUrl"
                  type="url"
                  value={personalPlaylistUrl}
                  onChange={(e) => setPersonalPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  required
                />
              </div>

              <button type="submit" className="btn-primary btn-personal" disabled={personalLoading}>
                {personalLoading ? '⏳ Adding...' : '⭐ Add Personal Playlist'}
              </button>
            </form>

            <div className="admin-info private-info">
              <h3>⭐ Private Playlist:</h3>
              <ul>
                <li>✓ This playlist will be added to YOUR courses only</li>
                <li>✓ Only YOU can see and access this playlist</li>
                <li>✓ Paste any YouTube playlist URL to get started</li>
                <li>✓ Your playlists will show a ⭐ badge</li>
                <li>✓ Videos are streamed (not downloaded)</li>
              </ul>
            </div>
          </section>

          {/* My Courses Section */}
          <section className="admin-section">
            <div className="section-header">
              <div>
                <h1>📚 All Courses</h1>
                <p className="admin-subtitle">
                  Your private playlists (⭐) can be deleted • Public playlists (🌐) are managed by admin
                </p>
              </div>
              <button 
                className="btn-refresh" 
                onClick={fetchCourses}
                disabled={loadingCourses}
                title="Refresh courses list"
              >
                🔄 {loadingCourses ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {loadingCourses ? (
              <p className="loading-text">Loading courses...</p>
            ) : courses.length === 0 ? (
              <p className="no-courses-text">No courses found. Add your first playlist above!</p>
            ) : (
              <div className="courses-list">
                {courses.map((course) => (
                  <div key={course._id} className="course-item">
                    <span className={`course-badge ${course.isPersonal ? 'personal' : 'public'}`}>
                      {course.isPersonal ? '⭐ My Course' : '🌐 Public'}
                    </span>
                    <div className="course-info">
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt={course.title} className="course-thumb" />
                      )}
                      <div className="course-details">
                        <h3>{course.title}</h3>
                        <p className="course-meta">
                          {course.lessonCount || 0} lessons • {course.level || 'N/A'} level
                        </p>
                        {course.description && (
                          <p className="course-description">{course.description.substring(0, 100)}...</p>
                        )}
                      </div>
                    </div>
                    {/* Only show delete button for personal courses OR if user is admin */}
                    {(course.isPersonal || user?.role === 'admin') && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteCourse(course._id, course.title)}
                        disabled={deletingCourseId === course._id}
                      >
                        {deletingCourseId === course._id ? '⏳ Deleting...' : '🗑️ Delete'}
                      </button>
                    )}
                    {/* Show info for public courses that can't be deleted by regular users */}
                    {!course.isPersonal && user?.role !== 'admin' && (
                      <div className="course-status">
                        <span className="status-text">📌 Public</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </MacWindow>
      <Dock toggleTheme={toggleTheme} theme={theme} />
    </div>
  )
}
