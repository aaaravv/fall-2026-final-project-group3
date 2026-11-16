import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AnimatedBackground } from './Components/AnimatedBackground'
import { OnboardingFlow } from './pages/OnboardingFlow'
import './App.css'
import ClubLeaderboardPage from './pages/clubLeaderboardPage'
import ClubsPage from './pages/clubsPage'
import Home from './pages/Home'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <AnimatedBackground />
      <Routes>
        <Route path="/" element={<OnboardingFlow />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route
          path="/clubs/:clubId/leaderboard"
          element={<ClubLeaderboardPage />}
        />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App