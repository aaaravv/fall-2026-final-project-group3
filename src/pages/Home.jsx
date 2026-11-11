import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <main className= "home-container">
      {/* lesson/left column */}
      <aside className="home-sidebar left-sidebar">
        <h2>Lesson</h2>
        {}
      </aside>
    </main>
  )

  return <Link to="/clubs">View Clubs</Link>
}

export default Home