import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { api } from "../api";
import NodeAvatar from "./NodeAvatar";

export default function RightRail() {
  const { currentUser } = useUser();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    api
      .getSuggestions(currentUser.user_id)
      .then((list) => setSuggestions(list.slice(0, 4)))
      .catch(() => setSuggestions([]));
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <aside className="right-rail">
      <div className="panel">
        <p className="rail-title">Who to follow</p>
        <div className="rail-list">
          {suggestions.length === 0 && (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Nothing yet</span>
          )}
          {suggestions.map((s) => (
            <Link to={`/profile/${s.user_id}`} className="rail-item" key={s.user_id}>
              <NodeAvatar id={s.user_id} name={s.name} size={26} />
              <span>{s.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
