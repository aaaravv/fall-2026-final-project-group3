import { useState } from 'react'
import { AnimatedBackground } from './Components/AnimatedBackground'
import { OnboardingFlow } from './Components/OnboardingFlow'
import './App.css'
import ProfilePage from './pages/ProfilePage'

function App() {
  const [count, setCount] = useState(0)

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
  );
}

export default App
