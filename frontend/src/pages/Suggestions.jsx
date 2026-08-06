import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { api } from "../api";
import NodeAvatar from "../components/NodeAvatar";

function Edge({ weight }) {
  const dotCount = Math.min(weight, 4);
  return (
    <svg className="edge-svg" viewBox="0 0 100 20" preserveAspectRatio="none">
      <line x1="0" y1="10" x2="100" y2="10" stroke="#c3cde0" strokeWidth="1.5" />
      {Array.from({ length: dotCount }).map((_, i) => (
        <circle
          key={i}
          cx={(100 / (dotCount + 1)) * (i + 1)}
          cy="10"
          r="2.5"
          fill="#d9722f"
        />
      ))}
    </svg>
  );
}

export default function Suggestions() {
  const { currentUser } = useUser();
  const [suggestions, setSuggestions] = useState(null);
  const [followed, setFollowed] = useState({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!currentUser) return;
    try {
      const list = await api.getSuggestions(currentUser.user_id);
      setSuggestions(list);
    } catch {
      setError("Couldn't load suggestions. Is the backend running?");
    }
  }, [currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFollow(targetId) {
    setFollowed((f) => ({ ...f, [targetId]: "pending" }));
    try {
      await api.followUser(currentUser.user_id, targetId);
      setFollowed((f) => ({ ...f, [targetId]: "done" }));
    } catch {
      setFollowed((f) => ({ ...f, [targetId]: undefined }));
    }
  }

  return (
    <div>
      <p className="eyebrow">Suggestions</p>
      <h1 className="page-title" style={{ marginBottom: 18 }}>
        Two hops from you
      </h1>

      {error && <p className="error-text">{error}</p>}

      <div className="panel">
        {suggestions === null && <p className="empty-state">Traversing the graph…</p>}

        {suggestions && suggestions.length === 0 && (
          <div className="empty-state">
            <p className="empty-state-title">No suggestions right now</p>
            <p>Follow a few people first — suggestions come from people your connections follow.</p>
          </div>
        )}

        {suggestions &&
          suggestions.map((s) => {
            const state = followed[s.user_id];
            return (
              <div className="edge-row" key={s.user_id}>
                <div className="edge-you">
                  <NodeAvatar id={currentUser.user_id} name={currentUser.name} size={30} />
                  <span className="edge-label">you</span>
                </div>
                <Edge weight={s.mutual_count} />
                <div className="edge-target">
                  <NodeAvatar id={s.user_id} name={s.name} size={38} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Link to={`/profile/${s.user_id}`} className="edge-name" style={{ display: "block" }}>
                      {s.name}
                    </Link>
                    <span className="edge-id">
                      {s.mutual_count} mutual connection{s.mutual_count === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
                <button
                  className={"btn btn-sm " + (state === "done" ? "btn-outline" : "btn-accent")}
                  onClick={() => handleFollow(s.user_id)}
                  disabled={state === "pending" || state === "done"}
                  style={{ marginLeft: 10 }}
                >
                  {state === "done" ? "Following" : state === "pending" ? "…" : "Follow"}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
