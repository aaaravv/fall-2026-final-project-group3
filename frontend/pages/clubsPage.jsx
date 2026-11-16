import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clubs } from '../data/clubsData'
import ClubPasswordModal from '../Components/clubPasswordModal'

function ClubsPage() {
  const [selectedClub, setSelectedClub] = useState(null)
  const navigate = useNavigate()

  function handlePasswordSubmit(password) { // function to handle password submission for club access
    if (password === selectedClub.password) {
      navigate(`/clubs/${selectedClub.id}/leaderboard`)
      setSelectedClub(null)
    } else {
      alert('Incorrect password')
    }
  }

  return (  // main component for clubs page that displays a list of clubs and handles club selection and password submission
    <main className="clubs-page">

      {/* Back Arrow to Home */}
      <Link to="/home" className="home-nav-arrow right-arrow" aria-label="Go to Home">
        →
      </Link>

      <h1>CLUBS</h1>

      <div className="clubs-grid">
        {clubs.map((club) => (
          <button
            key={club.id}
            className="club-card"
            onClick={() => setSelectedClub(club)}
          >
            <span>{club.name}</span>
            <span className="club-arrow">→</span>
          </button>
        ))}
      </div>

      {selectedClub && (
        <ClubPasswordModal
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </main>
  )
}

export default ClubsPage