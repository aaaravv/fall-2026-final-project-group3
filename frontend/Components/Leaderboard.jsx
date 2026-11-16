// import { leaderboardData } from '../data/leaderboardData'

function getRankDisplay(rank) { // medal emojis
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'

  return rank
}

export function Leaderboard() {
  return (
    <div className="leaderboard-container">
      <div className="leaderboard">
        <h1 className="leaderboard-title">GENERAL</h1>

        <div className="leaderboard-header">
          <span>RANK</span>
          <span>NAME</span>
        </div>

        <div className="leaderboard-list">
          {leaderboardData.map((player) => (    // map through leaderboard data and render each player
            <div
              key={player.rank}
              className={`leaderboard-row ${
                player.name === currentUser ? 'current-user' : ''
              }`}
            >
              <span className="rank">
                {getRankDisplay(player.rank)}
              </span>

              <span className="player-name">
                {player.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}