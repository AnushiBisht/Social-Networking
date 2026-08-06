import { Navigate, Route, Routes } from "react-router-dom";
import { useUser } from "./context/UserContext";
import NavRail from "./components/NavRail";
import RightRail from "./components/RightRail";
import Identify from "./pages/Identify";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Suggestions from "./pages/Suggestions";
import Ask from "./pages/Ask";

function RequireUser({ children }) {
  const { currentUser } = useUser();
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { currentUser } = useUser();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="*" element={<Identify />} />
      </Routes>
    );
  }

  return (
    <div className="shell">
      <NavRail />
      <div className="main-col">
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route
            path="/feed"
            element={
              <RequireUser>
                <Feed />
              </RequireUser>
            }
          />
          <Route
            path="/suggestions"
            element={
              <RequireUser>
                <Suggestions />
              </RequireUser>
            }
          />
          <Route
            path="/ask"
            element={
              <RequireUser>
                <Ask />
              </RequireUser>
            }
          />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </div>
      <RightRail />
    </div>
  );
}
