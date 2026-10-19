import { useAuth } from "../auth/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <main className="page">
      <h1>Hi, {user.displayName?.split(" ")[0] || "there"}</h1>
      <p>{user.email}</p>
      <button className="btn" onClick={logout}>Sign out</button>
    </main>
  );
}