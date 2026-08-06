import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { api, ApiError } from "../api";
import NodeAvatar from "../components/NodeAvatar";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { userId } = useParams();
  const { currentUser } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followState, setFollowState] = useState("idle"); // idle | following | done
  const [jumpId, setJumpId] = useState("");

  const isSelf = currentUser?.user_id === userId;

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [p, f] = await Promise.all([api.getProfile(userId), api.getFollowers(userId)]);
      setProfile(p);
      setFollowers(f);
      setFollowState(f.some((u) => u.user_id === currentUser?.user_id) ? "done" : "idle");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFollow() {
    if (!currentUser || isSelf) return;
    setFollowState("following");
    try {
      await api.followUser(currentUser.user_id, userId);
      setFollowState("done");
      load();
    } catch {
      setFollowState("idle");
    }
  }

  function handleJump(e) {
    e.preventDefault();
    if (jumpId.trim()) navigate(`/profile/${jumpId.trim()}`);
  }

  if (loading) return <p className="empty-state">Loading profile…</p>;

  if (notFound) {
    return (
      <div className="panel empty-state">
        <p className="empty-state-title">No such node</p>
        <p>There's no user with ID “{userId}” in the graph.</p>
      </div>
    );
  }

  return (
    <div>
      <form className="jump-form" onSubmit={handleJump}>
        <input
          placeholder="Jump to a user_id…"
          value={jumpId}
          onChange={(e) => setJumpId(e.target.value)}
        />
        <button className="btn btn-outline btn-sm" type="submit">
          Go
        </button>
      </form>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="profile-head">
          <NodeAvatar id={profile.user_id} name={profile.name} size={56} />
          <div style={{ flex: 1 }}>
            <h1 className="page-title">{profile.name}</h1>
            <div className="profile-id">@{profile.user_id}</div>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <div className="stat-row">
              <span className="stat">
                <b>{followers.length}</b> followers
              </span>
              <span className="stat">
                <b>{profile.posts?.length ?? 0}</b> posts
              </span>
            </div>
          </div>
          {!isSelf && currentUser && (
            <button
              className={"btn btn-sm " + (followState === "done" ? "btn-outline" : "btn-accent")}
              onClick={handleFollow}
              disabled={followState !== "idle"}
            >
              {followState === "done" ? "Following" : followState === "following" ? "…" : "Follow"}
            </button>
          )}
        </div>
      </div>

      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Posts
      </p>
      {profile.posts && profile.posts.length > 0 ? (
        <div className="post-list">
          {profile.posts.map((post) => (
            <PostCard key={post.post_id} post={{ ...post, author: profile.name }} authorId={profile.user_id} />
          ))}
        </div>
      ) : (
        <div className="panel empty-state">
          <p className="empty-state-title">No posts yet</p>
        </div>
      )}
    </div>
  );
}
