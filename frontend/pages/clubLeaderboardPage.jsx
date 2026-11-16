import { useParams, Link } from 'react-router-dom'
import { clubs } from '../data/clubsData'
import { Leaderboard } from '../Components/Leaderboard'

function ClubLeaderboardPage() {    // club leaderboard page component that renders Leaderboard component for a specific club
  const { clubId } = useParams()

  const club = clubs.find((club) => club.id === clubId)

  if (!club) {
    return <h1>Club not found</h1>
  }

  return (
    <main className="club-leaderboard-page">
      <Link to="/clubs" className="back-link">
        ← Back to Clubs
      </Link>

      <Leaderboard
        title={club.name}
        leaderboardData={club.members}
        currentUser="Hunter Andrews"
      />
    </main>
  )
}

export default ClubLeaderboardPage