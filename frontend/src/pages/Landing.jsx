import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Landing() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSignIn = async () => {
    try {
      setError("");
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Sign in failed. Try again.");
        console.error(err);
      }
    }
  };

  return (
    <main className="page">
      <h1>StretchMaster</h1>
      <p>Guided recovery stretches at home. Your camera tracks your form and shows you what to fix.</p>
      <div className="actions">
        <button className="btn primary" onClick={handleSignIn}>
          Continue with Google
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </main>
  );
}