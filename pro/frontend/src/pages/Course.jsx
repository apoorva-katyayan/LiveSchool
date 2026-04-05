import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import MacWindow from '../components/MacWindow'
import Dock from '../components/Dock'
import Tabs from '../components/Tabs'
import './Course.css'

export default function Course({ toggleTheme, theme }) {
  const { id } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [completedLessons, setCompletedLessons] = useState(new Set())
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [sendingChat, setSendingChat] = useState(false)

  const tabs = [
    { label: 'Lessons' },
    { label: 'Description' },
    { label: 'Chat Assistant' }
  ]

  useEffect(() => {
    fetchCourse()
    fetchProgress()
    fetchChatHistory()
  }, [id])

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}`)
      setCourse(response.data)
      if (response.data.lessons && response.data.lessons.length > 0) {
        setSelectedLesson(response.data.lessons[0])
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`/api/progress/course/${id}`)
      const completed = new Set(
        response.data
          .filter(p => p.completed)
          .map(p => String(p.lessonId))
      )
      setCompletedLessons(completed)
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`/api/chat/history/${id}`)
      setChatHistory(response.data)
    } catch (error) {
      console.error('Error fetching chat history:', error)
    }
  }

  const markComplete = async (lessonId) => {
    try {
      const idString = String(lessonId)
      await axios.post('/api/progress/complete', { lessonId: idString })
      setCompletedLessons(prev => new Set([...prev, idString]))
    } catch (error) {
      console.error('Error marking lesson complete:', error)
    }
  }

  const sendChatMessage = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim() || sendingChat) return

    setSendingChat(true)
    const userMessage = { role: 'user', message: chatMessage, createdAt: new Date() }
    setChatHistory(prev => [...prev, userMessage])
    setChatMessage('')

    try {
      const response = await axios.post('/api/chat', {
        message: chatMessage,
        courseId: id
      })
      const assistantMessage = {
        role: 'assistant',
        message: response.data.response,
        sources: response.data.sources,
        createdAt: new Date()
      }
      setChatHistory(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending chat message:', error)
      const errorMessage = {
        role: 'assistant',
        message: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date()
      }
      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setSendingChat(false)
    }
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="course-page">
        <div className="loading">Loading course...</div>
        <Dock toggleTheme={toggleTheme} theme={theme} />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="course-page">
        <div className="error">Course not found</div>
        <Dock toggleTheme={toggleTheme} theme={theme} />
      </div>
    )
  }

  return (
    <div className="course-page">
      <div className="course-container">
        <MacWindow title={course.title} className="course-window">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="course-content">
            {activeTab === 0 && (
              <div className="lessons-layout">
                <div className="syllabus-sidebar">
                  <h3>Syllabus</h3>
                  <div className="lessons-list">
                    {course.lessons?.map((lesson, index) => (
                      <div
                        key={lesson._id}
                        className={`lesson-item ${selectedLesson?._id === lesson._id ? 'active' : ''}`}
                        onClick={() => setSelectedLesson(lesson)}
                      >
                        <div className="lesson-number">{index + 1}</div>
                        <div className="lesson-details">
                          <div className="lesson-title">{lesson.title}</div>
                          <div className="lesson-meta">
                            {lesson.duration > 0 && (
                              <span>{formatDuration(lesson.duration)}</span>
                            )}
                            {completedLessons.has(String(lesson._id)) && (
                              <span className="completed">✓ Completed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="video-section">
                  {selectedLesson ? (
                    <>
                      <div className="video-player">
                        <iframe
                          width="100%"
                          height="500"
                          src={`https://www.youtube.com/embed/${selectedLesson.videoId}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="lesson-info">
                        <h2>{selectedLesson.title}</h2>
                        {selectedLesson.description && (
                          <p className="lesson-description">{selectedLesson.description}</p>
                        )}
                        <button
                          className={`complete-button ${completedLessons.has(String(selectedLesson._id)) ? 'completed' : ''}`}
                          onClick={() => markComplete(selectedLesson._id)}
                        >
                          {completedLessons.has(String(selectedLesson._id)) 
                            ? '✓ Completed' 
                            : 'Mark as Complete'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="no-lesson">Select a lesson to start</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="description-tab">
                <h2>About this course</h2>
                <p className="course-description">{course.description || 'No description available.'}</p>
                {course.provider && (
                  <div className="course-meta-info">
                    <p><strong>Provider:</strong> {course.provider.name}</p>
                    {course.level && <p><strong>Level:</strong> {course.level}</p>}
                    {course.language && <p><strong>Language:</strong> {course.language}</p>}
                  </div>
                )}
              </div>
            )}

            {activeTab === 2 && (
              <div className="chat-tab">
                <div className="chat-history">
                  {chatHistory.length === 0 ? (
                    <div className="chat-empty">
                      Ask me anything about this course!
                    </div>
                  ) : (
                    chatHistory.map((msg, index) => (
                      <div key={index} className={`chat-message ${msg.role}`}>
                        <div className="message-content">{msg.message}</div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="message-sources">
                            <strong>Sources:</strong>
                            {msg.sources.map((source, i) => (
                              <div key={i} className="source-item">
                                {source.title} (Video: {source.videoId})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={sendChatMessage} className="chat-input-form">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask a question about this course..."
                    disabled={sendingChat}
                  />
                  <button type="submit" disabled={sendingChat || !chatMessage.trim()}>
                    {sendingChat ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </MacWindow>
      </div>
      <Dock toggleTheme={toggleTheme} theme={theme} />
    </div>
  )
}
