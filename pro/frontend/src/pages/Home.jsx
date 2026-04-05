import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import MacWindow from '../components/MacWindow'
import Dock from '../components/Dock'
import './Home.css'

export default function Home({ toggleTheme, theme }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    level: '',
    language: '',
    tags: []
  })
  const [filterMeta, setFilterMeta] = useState({
    subjects: [],
    levels: [],
    languages: [],
    tags: []
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchFilterMeta()
    fetchCourses()
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [filters])

  const fetchFilterMeta = async () => {
    try {
      const response = await axios.get('/api/courses/meta/filters')
      setFilterMeta(response.data)
    } catch (error) {
      console.error('Error fetching filter metadata:', error)
    }
  }

  const fetchCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append('limit', '50') // Limit initial load
      if (filters.search) params.append('search', filters.search)
      if (filters.subject) params.append('subject', filters.subject)
      if (filters.level) params.append('level', filters.level)
      if (filters.language) params.append('language', filters.language)
      if (filters.tags.length > 0) params.append('tags', filters.tags.join(','))

      const response = await axios.get(`/api/courses?${params.toString()}`)
      console.log('Courses response:', response.data)
      setCourses(response.data.courses || [])
      
      if (!response.data.courses || response.data.courses.length === 0) {
        setError('No courses found. Import a YouTube playlist from the Admin page to get started!')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError(error.response?.data?.error || 'Failed to load courses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  return (
    <div className="home-page">
      <MacWindow title="Live School - Browse Courses" className="home-window">
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
              >
                <option value="">All Subjects</option>
                {filterMeta.subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Level</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
              >
                <option value="">All Levels</option>
                {filterMeta.levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Language</label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
              >
                <option value="">All Languages</option>
                {filterMeta.languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {filterMeta.tags.length > 0 && (
            <div className="tags-filter">
              <label>Tags</label>
              <div className="tags-list">
                {filterMeta.tags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    className={`tag-button ${filters.tags.includes(tag) ? 'active' : ''}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="courses-grid">
          {loading ? (
            <div className="loading">Loading courses...</div>
          ) : error ? (
            <div className="empty-state error-state">
              <p>{error}</p>
              {error.includes('Import') && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="btn-primary"
                  style={{ marginTop: '16px', width: 'auto', padding: '12px 24px' }}
                >
                  Go to Admin Page
                </button>
              )}
            </div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <p>No courses found. Try adjusting your filters or import a course from the Admin page.</p>
              <button 
                onClick={() => navigate('/admin')}
                className="btn-primary"
                style={{ marginTop: '16px', width: 'auto', padding: '12px 24px' }}
              >
                Import Playlist
              </button>
            </div>
          ) : (
            courses.map(course => (
              <div
                key={course._id}
                className="course-card"
                onClick={() => navigate(`/course/${course._id}`)}
              >
                <span className={`course-badge ${course.isPersonal ? 'personal' : 'public'}`}>
                  {course.isPersonal ? '⭐' : '🌐'}
                </span>
                <div className="course-thumbnail">
                  {course.thumbnail && (
                    <img src={course.thumbnail} alt={course.title} />
                  )}
                </div>
                <div className="course-info">
                  <h3>{course.title}</h3>
                  {course.provider && (
                    <p className="course-provider">{course.provider.name}</p>
                  )}
                  {course.description && (
                    <p className="course-description">
                      {course.description.substring(0, 100)}...
                    </p>
                  )}
                  <div className="course-meta">
                    <span>{course.lessonCount || 0} lessons</span>
                    {course.level && <span>{course.level}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </MacWindow>
      <Dock toggleTheme={toggleTheme} theme={theme} />
    </div>
  )
}
