import { NavLink } from "react-router-dom";
import { useUser } from "../context/UserContext";
import NodeAvatar from "./NodeAvatar";

const LINKS = [
  { to: "/feed", label: "Feed" },
  { to: "/suggestions", label: "Suggestions" },
  { to: "/ask", label: "Ask the graph" },
];

export default function NavRail() {
  const { currentUser, setCurrentUser } = useUser();

  return (
    <nav className="nav-rail">
      <div className="brand">
        <span className="brand-mark">●</span>Node
      </div>
      <div className="brand-sub">graph-native network</div>

      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          <span className="nav-dot" />
          {link.label}
        </NavLink>
      ))}

      {currentUser && (
        <NavLink
          to={`/profile/${currentUser.user_id}`}
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          <span className="nav-dot" />
          My profile
        </NavLink>
      )}

      {currentUser && (
        <div className="nav-footer">
          <div className="nav-me">
            <NodeAvatar id={currentUser.user_id} name={currentUser.name} size={26} />
            <span>{currentUser.name}</span>
          </div>
          <button className="nav-switch" onClick={() => setCurrentUser(null)}>
            switch identity
          </button>
        </div>
      )}
    </nav>
  );
}
