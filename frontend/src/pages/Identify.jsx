import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { api, ApiError } from "../api";

export default function Identify() {
  const { setCurrentUser } = useUser();
  const navigate = useNavigate();
  const [mode, setMode] = useState("existing"); // "existing" | "new"
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleExisting(e) {
    e.preventDefault();
    setError("");
    if (!userId.trim()) return;
    setBusy(true);
    try {
      const profile = await api.getProfile(userId.trim());
      setCurrentUser({ user_id: profile.user_id, name: profile.name });
      navigate("/feed");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? "No user with that ID exists yet — create one instead."
          : "Couldn't reach the network. Is the backend running?"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    if (!userId.trim() || !name.trim()) return;
    setBusy(true);
    try {
      await api.createUser({ user_id: userId.trim(), name: name.trim(), bio: bio.trim() || null });
      setCurrentUser({ user_id: userId.trim(), name: name.trim() });
      navigate("/feed");
    } catch (err) {
      setError("Couldn't create that user. Check the backend is running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="identify-wrap">
      <div className="panel identify-card">
        <h1 className="identify-title">Node</h1>
        <p className="identify-sub">graph-native network — enter the graph</p>

        <div className="mode-toggle">
          <button
            type="button"
            className={"mode-btn" + (mode === "existing" ? " active" : "")}
            onClick={() => setMode("existing")}
          >
            I have an ID
          </button>
          <button
            type="button"
            className={"mode-btn" + (mode === "new" ? " active" : "")}
            onClick={() => setMode("new")}
          >
            New here
          </button>
        </div>

        {mode === "existing" ? (
          <form onSubmit={handleExisting}>
            <div className="field">
              <label htmlFor="uid">Your user ID</label>
              <input
                id="uid"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. maya_k"
                autoFocus
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn-accent" type="submit" disabled={busy} style={{ width: "100%" }}>
              {busy ? "Connecting…" : "Enter the graph"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="new-uid">Choose a user ID</label>
              <input
                id="new-uid"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. maya_k"
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="name">Display name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Maya Khatri" />
            </div>
            <div className="field">
              <label htmlFor="bio">Bio (optional)</label>
              <textarea id="bio" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn-accent" type="submit" disabled={busy} style={{ width: "100%" }}>
              {busy ? "Creating…" : "Create and enter"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
