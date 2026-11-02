import { useState } from 'react'

function ClubPasswordModal({ club, onClose, onSubmit }) {
  const [password, setPassword] = useState('')

  function handleSubmit(e) {    // function to handle form submission for club password modal
    e.preventDefault()
    onSubmit(password)
  }

  return (  // modal component for club password input that handles form submission and closing modal
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="password-modal"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

        <h2>{club.name}</h2>
        <p>Enter the club password to continue.</p>

        <input
          type="password"
          placeholder="Club password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />

        <button type="submit" className="unlock-button">
          UNLOCK CLUB
        </button>
      </form>
    </div>
  )
}

export default ClubPasswordModal