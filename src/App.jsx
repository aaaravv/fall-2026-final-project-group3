import { AnimatedBackground } from './Components/AnimatedBackground'
import { OnboardingFlow } from './Components/OnboardingFlow'
import './App.css'
import ProfilePage from './pages/ProfilePage'

function App() {
  if (window.location.pathname === '/profile') {
    return (
      <>
        <AnimatedBackground />
        <ProfilePage />
      </>
    )
  }

  return (
    <>
      {/* Background and Signin/up */}
      <AnimatedBackground />
      <OnboardingFlow />
    </>
  )
}

export default App