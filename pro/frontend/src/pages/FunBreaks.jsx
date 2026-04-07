import { useState, useEffect, useRef } from 'react'
import MacWindow from '../components/MacWindow'
import Dock from '../components/Dock'
import Tabs from '../components/Tabs'
import './FunBreaks.css'

export default function FunBreaks({ toggleTheme, theme }) {
  const [activeTab, setActiveTab] = useState(0)
  const [breathingPhase, setBreathingPhase] = useState('inhale') // inhale, hold, exhale, hold
  const [breathingActive, setBreathingActive] = useState(false)
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0)
  const [pomodoroActive, setPomodoroActive] = useState(false)
  const [sounds, setSounds] = useState({
    rain: false,
    ocean: false,
    forest: false
  })

  const tabs = [
    { label: 'Box Breathing' },
    { label: 'Pomodoro Timer' },
    { label: 'Ambient Sounds' }
  ]

  // Box Breathing
  useEffect(() => {
    if (!breathingActive) return

    const phases = [
      { name: 'inhale', duration: 4000 },
      { name: 'hold', duration: 4000 },
      { name: 'exhale', duration: 4000 },
      { name: 'hold', duration: 4000 }
    ]

    let phaseIndex = 0
    setBreathingPhase(phases[phaseIndex].name)

    const interval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length
      setBreathingPhase(phases[phaseIndex].name)
    }, phases[phaseIndex].duration)

    return () => clearInterval(interval)
  }, [breathingActive])

  // Pomodoro Timer
  useEffect(() => {
    if (!pomodoroActive) return

    const interval = setInterval(() => {
      setPomodoroSeconds(prev => {
        if (prev > 0) return prev - 1
        if (pomodoroMinutes > 0) {
          setPomodoroMinutes(prev => prev - 1)
          return 59
        }
        // Timer complete
        setPomodoroActive(false)
        alert('Pomodoro complete! Take a break! 🎉')
        return 0
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [pomodoroActive, pomodoroMinutes])

  const resetPomodoro = () => {
    setPomodoroMinutes(25)
    setPomodoroSeconds(0)
    setPomodoroActive(false)
  }

  const formatTime = (minutes, seconds) => {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const toggleSound = (soundName) => {
    setSounds(prev => ({
      ...prev,
      [soundName]: !prev[soundName]
    }))
  }

  return (
    <div className="fun-breaks-page">
      <MacWindow title="Fun Breaks" className="fun-breaks-window">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="fun-content">
          {activeTab === 0 && (
            <div className="breathing-section">
              <h2>Box Breathing</h2>
              <p className="section-description">
                A simple breathing technique to help reduce stress and improve focus.
                Breathe in for 4 seconds, hold for 4, breathe out for 4, hold for 4.
              </p>
              <div className="breathing-circle-container">
                <div className={`breathing-circle ${breathingPhase} ${breathingActive ? 'active' : ''}`}>
                  <span className="breathing-text">
                    {breathingActive ? (
                      <>
                        {breathingPhase === 'inhale' && 'Breathe In'}
                        {breathingPhase === 'hold' && 'Hold'}
                        {breathingPhase === 'exhale' && 'Breathe Out'}
                      </>
                    ) : (
                      'Click to Start'
                    )}
                  </span>
                </div>
              </div>
              <button
                className="breathing-button"
                onClick={() => setBreathingActive(!breathingActive)}
              >
                {breathingActive ? 'Stop' : 'Start'}
              </button>
            </div>
          )}

          {activeTab === 1 && (
            <div className="pomodoro-section">
              <h2>Pomodoro Timer</h2>
              <p className="section-description">
                Work in focused 25-minute intervals. When the timer finishes, take a 5-minute break.
              </p>
              <div className="timer-display">
                {formatTime(pomodoroMinutes, pomodoroSeconds)}
              </div>
              <div className="timer-controls">
                <button
                  className="timer-button"
                  onClick={() => setPomodoroActive(!pomodoroActive)}
                >
                  {pomodoroActive ? 'Pause' : 'Start'}
                </button>
                <button className="timer-button" onClick={resetPomodoro}>
                  Reset
                </button>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="sounds-section">
              <h2>Ambient Sounds</h2>
              <p className="section-description">
                Peaceful environment with ambient background sounds.
              </p>
              <div className="sounds-grid">
                <button
                  className={`sound-card ${sounds.rain ? 'active' : ''}`}
                  onClick={() => toggleSound('rain')}
                >
                  <span className="sound-icon">🌧️</span>
                  <span className="sound-name">Rain</span>
                  {sounds.rain && <span className="sound-indicator">●</span>}
                </button>
                <button
                  className={`sound-card ${sounds.ocean ? 'active' : ''}`}
                  onClick={() => toggleSound('ocean')}
                >
                  <span className="sound-icon">🌊</span>
                  <span className="sound-name">Ocean</span>
                  {sounds.ocean && <span className="sound-indicator">●</span>}
                </button>
                <button
                  className={`sound-card ${sounds.forest ? 'active' : ''}`}
                  onClick={() => toggleSound('forest')}
                >
                  <span className="sound-icon">🌲</span>
                  <span className="sound-name">Forest</span>
                  {sounds.forest && <span className="sound-indicator">●</span>}
                </button>
              </div>
              
            </div>
          )}
        </div>
      </MacWindow>
      <Dock toggleTheme={toggleTheme} theme={theme} />
    </div>
  )
}
