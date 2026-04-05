import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Dock.css'

export default function Dock({ toggleTheme, theme }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const dockItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '📚', label: 'My Courses', path: '/my-courses' },
    { icon: '😊', label: 'Fun', path: '/fun' }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dock">
      {dockItems.map((item, index) => (
        <button
          key={index}
          className={`dock-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
          title={item.label}
        >
          <span className="dock-icon">{item.icon}</span>
        </button>
      ))}
      <div className="dock-divider"></div>
      <button
        className="dock-item theme-toggle"
        onClick={toggleTheme}
        title={theme === 'light' ? 'Dark mode' : 'Light mode'}
      >
        <span className="dock-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
      </button>
      <button
        className="dock-item logout-btn"
        onClick={handleLogout}
        title="Logout"
      >
        <span className="dock-icon">🚪</span>
      </button>
    </div>
  )
}
