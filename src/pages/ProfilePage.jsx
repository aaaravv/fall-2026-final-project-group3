import { useState } from 'react'
import './ProfilePage.css'

const demoPrograms = [
  {
    id: 'upper-body',
    name: 'Upper body mobility',
    focus: 'Shoulders and upper body',
    sessionsThisWeek: 2,
    weeklyTarget: 3,
    totalSessions: 6,
    exercises: ['Shoulder stretch', 'Cross-body stretch'],
  },
  {
    id: 'lower-body',
    name: 'Lower body flexibility',
    focus: 'Legs and lower body',
    sessionsThisWeek: 1,
    weeklyTarget: 1,
    totalSessions: 2,
    exercises: ['Hamstring stretch', 'Calf stretch'],
  },
]

function ProfilePage() {
  const [showDemo, setShowDemo] = useState(true)
  const [filter, setFilter] = useState('all')

  const programs = showDemo ? demoPrograms : []

  const weeklySessions = programs.reduce(
    (total, program) => total + program.sessionsThisWeek,
    0,
  )

  const weeklyTarget = programs.reduce(
    (total, program) => total + program.weeklyTarget,
    0,
  )

  const totalSessions = programs.reduce(
    (total, program) => total + program.totalSessions,
    0,
  )

  const weeklyProgress = weeklyTarget > 0
    ? Math.min(Math.round((weeklySessions / weeklyTarget) * 100), 100)
    : 0

  const filteredPrograms = programs.filter((program) => {
    const goalMet = program.sessionsThisWeek >= program.weeklyTarget

    if (filter === 'in-progress') return !goalMet
    if (filter === 'goal-met') return goalMet
    return true
  })

  return (
    <main className="profile-page">
      <header className="profile-heading">
        <p className="profile-brand">StretchMaster</p>
        <h1>My profile</h1>
        <p>Keep track of your programs and the progress you make each week.</p>
      </header>

      <aside className="profile-preview" aria-label="Preview controls">
        <div>
          <strong>Sprint 2 preview</strong>
          <p>
            {showDemo
              ? 'Showing sample programs and activity, not saved user data.'
              : 'Showing how the page looks before activity is available.'}
          </p>
        </div>

        <label className="profile-demo-toggle">
          <input
            type="checkbox"
            checked={showDemo}
            onChange={(event) => setShowDemo(event.target.checked)}
          />
          Show sample data
        </label>
      </aside>

      <section className="profile-card profile-identity" aria-label="Profile">
        <div className="profile-avatar" aria-hidden="true">
          {showDemo ? 'DM' : 'SM'}
        </div>

        <div>
          <h2>{showDemo ? 'Demo member' : 'Your profile'}</h2>
          <p>Your stretching progress, all in one place.</p>
        </div>
      </section>

      <section className="profile-stats" aria-label="Activity summary">
        <div className="profile-card profile-stat">
          <span>Total sessions</span>
          <strong>{totalSessions}</strong>
          <p>Completed across your programs</p>
        </div>

        <div className="profile-card profile-stat">
          <span>This week</span>
          <strong>{weeklySessions}</strong>
          <p>Sessions completed this week</p>
        </div>

        <div className="profile-card profile-stat">
          <span>My programs</span>
          <strong>{programs.length}</strong>
          <p>Programs in your routine</p>
        </div>
      </section>

      <section className="profile-card" aria-labelledby="weekly-progress-title">
        <div className="profile-section-heading">
          <div>
            <h2 id="weekly-progress-title">Weekly goal</h2>
            <p>
              {weeklyTarget > 0
                ? `${weeklySessions} of ${weeklyTarget} planned sessions completed`
                : 'Your weekly goal will appear when you have a program.'}
            </p>
          </div>

          {weeklyTarget > 0 && (
            <span className="profile-percentage">{weeklyProgress}%</span>
          )}
        </div>

        <progress
          className="profile-progress"
          value={weeklyProgress}
          max="100"
          aria-label="Weekly session goal completion"
        />

        <p className="profile-progress-note">
          Progress reflects completed sessions toward your weekly goal.
        </p>
      </section>

      <section aria-labelledby="my-programs-title">
        <div className="profile-programs-heading">
          <h2 id="my-programs-title">My programs</h2>

          <label className="profile-filter">
            Show
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All programs</option>
              <option value="in-progress">Goal in progress</option>
              <option value="goal-met">Weekly goal met</option>
            </select>
          </label>
        </div>

        {programs.length === 0 ? (
          <div className="profile-card profile-empty">
            <h3>No programs yet</h3>
            <p>
              Your programs and session progress will appear here once
              you get started.
            </p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="profile-card profile-empty">
            <h3>No matching programs</h3>
            <p>Choose another filter to see the rest of your programs.</p>
          </div>
        ) : (
          <div className="profile-program-grid">
            {filteredPrograms.map((program) => {
              const goalMet =
                program.sessionsThisWeek >= program.weeklyTarget

              return (
                <article className="profile-card" key={program.id}>
                  <span
                    className={`profile-badge ${
                      goalMet ? 'profile-badge-complete' : ''
                    }`}
                  >
                    {goalMet ? 'Weekly goal met' : 'In progress'}
                  </span>

                  <h3 className="profile-program-name">{program.name}</h3>
                  <p>{program.focus}</p>

                  <div className="profile-program-progress">
                    <span>This week</span>
                    <strong>
                      {program.sessionsThisWeek} / {program.weeklyTarget}{' '}
                      {program.weeklyTarget === 1 ? 'session' : 'sessions'}
                    </strong>
                  </div>

                  <progress
                    className="profile-progress"
                    value={Math.min(
                      program.sessionsThisWeek,
                      program.weeklyTarget,
                    )}
                    max={program.weeklyTarget}
                    aria-label={`${program.name} weekly goal completion`}
                  />

                  <details className="profile-exercises">
                    <summary>
                      View exercises ({program.exercises.length})
                    </summary>
                    <ul>
                      {program.exercises.map((exercise) => (
                        <li key={exercise}>{exercise}</li>
                      ))}
                    </ul>
                  </details>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default ProfilePage