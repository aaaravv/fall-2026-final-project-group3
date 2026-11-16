import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <main className= "home-container">

      {/* Left Arrow Button -> Clubs */}
      <Link to="/clubs" className="home-nav-arrow left-arrow" aria-label="Go to Clubs">
        ←
      </Link>

      {/* lesson/left column */}
      <aside className="home-sidebar left-sidebar">
        <h2>Lesson</h2>
        {/* Left Column, lessons */}
        <div className="placeholder-box">Lesson Choices</div>
      </aside>

      {/* Center Column, camera implementation */}
      <section className="home-center">
        <div className="camera-placeholder"> 
          {/* camera implementation hook here */}
          <p> Camera feed container</p>
        </div>
      </section>

      <aside className="home-sidebar right-sidebar">
        <h2>Progress</h2>
        <div className="placeholder-box">Progress metrics</div>
      </aside>

      {/* Right Arrow Button -> Profile */}
      <Link to="/profile" className="home-nav-arrow right-arrow" aria-label="Go to Profile">
        →
      </Link>

    </main>
  )
}

export default Home