import { useState } from 'react'

// Preview rules aligned with the progress API in PR #53.
// Keep these IDs and thresholds synchronized when connecting the API.
const stretchRequirements = [
  {
    id: 'standing-quad-stretch',
    name: 'Standing Quad Stretch',
    requiredMinutes: 30,
    requiredStreakDays: 3,
    requiredMobilityLevel: 1,
  },
  {
    id: 'toe-touch-stretch',
    name: 'Butterfly Stretch',
    requiredMinutes: 60,
    requiredStreakDays: 0,
    requiredMobilityLevel: 2,
  },
  {
    id: 'right-split-stretch',
    name: 'Right Split Stretch',
    requiredMinutes: 150,
    requiredStreakDays: 7,
    requiredMobilityLevel: 3,
  },
  {
    id: 'left-split-opener',
    name: 'Left Split Stretch',
    requiredMinutes: 150,
    requiredStreakDays: 7,
    requiredMobilityLevel: 3,
  },
  {
    id: 'full-split-stretch',
    name: 'Full Split Stretch',
    requiredMinutes: 300,
    requiredStreakDays: 14,
    requiredMobilityLevel: 5,
  },
]

// Separate sample metrics; these are not calculated from weekly goals.
const demoProgress = {
  totalMinutes: 60,
  streakDays: 3,
  mobilityLevel: 2,
}

function StretchMilestones({ showDemo }) {
  const [filter, setFilter] = useState('all')

  const milestones = showDemo
    ? stretchRequirements.map((stretch) => {
        const requirements = [
          {
            label: 'Stretching time',
            current: demoProgress.totalMinutes,
            target: stretch.requiredMinutes,
            unit: 'minutes',
          },
          {
            label: 'Daily streak',
            current: demoProgress.streakDays,
            target: stretch.requiredStreakDays,
            unit: 'days',
          },
          {
            label: 'Mobility level',
            current: demoProgress.mobilityLevel,
            target: stretch.requiredMobilityLevel,
            unit: '',
          },
        ]

        const metCount = requirements.filter(
          (requirement) => requirement.current >= requirement.target,
        ).length

        return {
          ...stretch,
          requirements,
          metCount,
          eligible: metCount === requirements.length,
        }
      })
    : []

  const eligibleCount = milestones.filter(
    (milestone) => milestone.eligible,
  ).length

  const filteredMilestones = milestones.filter((milestone) => {
    if (filter === 'eligible') return milestone.eligible
    if (filter === 'locked') return !milestone.eligible
    return true
  })

  return (
    <section aria-labelledby="stretch-milestones-title">
      <div className="profile-programs-heading">
        <h2 id="stretch-milestones-title">Stretch milestones</h2>

        {showDemo && (
          <label className="profile-filter">
            Show
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter stretch milestones"
            >
              <option value="all">All milestones</option>
              <option value="eligible">Eligible stretches</option>
              <option value="locked">Locked stretches</option>
            </select>
          </label>
        )}
      </div>

      <p className="profile-milestone-intro">
        Explore the requirements for each stretch and see what comes next.
      </p>

      {!showDemo ? (
        <div className="profile-card profile-empty">
          <h3>No milestone activity to display</h3>
          <p>
            Turn on sample data to explore the stretch milestone preview.
          </p>
        </div>
      ) : (
        <>
          <div className="profile-card profile-milestone-summary">
            <strong>Sample progress</strong>
            <p>
              {demoProgress.totalMinutes} minutes of stretching ·{' '}
              {demoProgress.streakDays}-day streak · Mobility level{' '}
              {demoProgress.mobilityLevel} of 5
            </p>
            <p>
              <strong>
                {eligibleCount} of {milestones.length} milestones eligible
              </strong>
            </p>
            <p className="profile-progress-note">
              Sample activity only. This preview does not save or unlock
              lessons.
            </p>
          </div>

          <p
            className="profile-milestone-intro"
            role="status"
          >
            Showing {filteredMilestones.length} of {milestones.length}{' '}
            milestones.
          </p>

          {filteredMilestones.length === 0 ? (
            <div className="profile-card profile-empty">
              <h3>No matching milestones</h3>
              <p>Choose another filter to see more stretches.</p>
            </div>
          ) : (
            <div className="profile-program-grid">
              {filteredMilestones.map((milestone) => (
                <article className="profile-card" key={milestone.id}>
                  <span
                    className={`profile-badge ${
                      milestone.eligible ? 'profile-badge-complete' : ''
                    }`}
                  >
                    <span aria-hidden="true">
                      {milestone.eligible ? '✓' : '🔒'}
                    </span>{' '}
                    {milestone.eligible ? 'Eligible' : 'Locked'}
                  </span>

                  <h3 className="profile-program-name">
                    {milestone.name}
                  </h3>

                  <p>
                    Requires mobility level{' '}
                    {milestone.requiredMobilityLevel} of 5
                  </p>

                  <div className="profile-program-progress">
                    <span>Requirements met</span>
                    <strong>
                      {milestone.metCount} / {milestone.requirements.length}
                    </strong>
                  </div>

                  <progress
                    className="profile-progress"
                    value={milestone.metCount}
                    max={milestone.requirements.length}
                    aria-label={`${milestone.name} requirements met`}
                  />

                  <p className="profile-progress-note">
                    {milestone.eligible
                      ? 'All requirements are met in this sample.'
                      : 'Meet every requirement to become eligible.'}
                  </p>

                  <details className="profile-exercises">
                    <summary>View requirements</summary>

                    <ul className="profile-milestone-requirements">
                      {milestone.requirements.map((requirement) => {
                        const met =
                          requirement.current >= requirement.target

                        return (
                          <li key={requirement.label}>
                            <div>
                              <strong>{requirement.label}</strong>
                              <p>
                                {requirement.target === 0
                                  ? 'No streak required'
                                  : `${requirement.current} / ${requirement.target} ${requirement.unit}`.trim()}
                              </p>
                            </div>

                            <span
                              className={`profile-badge ${
                                met ? 'profile-badge-complete' : ''
                              }`}
                            >
                              {met ? 'Met' : 'Not yet'}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </details>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default StretchMilestones