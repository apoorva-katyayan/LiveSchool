import './MacWindow.css'

export default function MacWindow({ children, title, className = '' }) {
  return (
    <div className={`mac-window ${className}`}>
      <div className="window-chrome">
        <div className="traffic-lights">
          <div className="traffic-light red"></div>
          <div className="traffic-light yellow"></div>
          <div className="traffic-light green"></div>
        </div>
        <div className="window-title">{title}</div>
      </div>
      <div className="window-content">{children}</div>
    </div>
  )
}
