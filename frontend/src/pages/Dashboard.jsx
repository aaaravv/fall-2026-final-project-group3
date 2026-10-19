import { useAuth } from "../auth/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();


  return (

    // Greetings and user signout 
    <main className="page" style={{ padding: "40px", fontFamily: "Times New Roman", maxWidth: '800px', margin: '0 auto'}}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <div>
          <h1>Hey, {user.displayName?.split(" ")[0] || "there"}</h1>
          <p style={{ color: '#343232', margin: '5px 0 0 0' }}>{user.email}</p>
        </div>
        <button className="btn" onClick={logout} style={{padding: '8px 16px', backgroundColor: '#343232', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Sign out</button>
      </header>

      {/* "today's goal" display section */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>
        <div style={{ background: '#847e93', padding: '20px', borderRadius: '8px', border: '1px solid #262647' }}>
        <h3> Today's Goal</h3>
        <p>Complete 2 guided mobility stretches to keep your streak alive!</p>
        <button style={{ marginTop: '10px', padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Start Session
          </button>
        </div>

        <div style={{ background: '#8e6e93', padding: '20px', borderRadius: '8px', border: '1px solid #262647' }}>
          <h3> Progress</h3>
          <p>You have completed 3 out of 5 sessions this week.</p>
          <button style={{ marginTop: '10px', padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            View Progress
          </button>
        </div>  

      </section>
    </main>
  );
}