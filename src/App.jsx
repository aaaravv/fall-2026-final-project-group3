import { useState } from 'react'
import { AnimatedBackground } from './Components/AnimatedBackground'
import { OnboardingFlow } from './Components/OnboardingFlow'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* Background and Signin/up */}
      <AnimatedBackground />
      <OnboardingFlow />
    </> 
  );
}

export default App