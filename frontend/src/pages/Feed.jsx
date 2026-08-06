import { useEffect, useState, useCallback } from "react";
import { useUser } from "../context/UserContext";
import { api } from "../api";
import PostCard from "../components/PostCard";

export default function Feed() {
  const { currentUser } = useUser();
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [content, setContent] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError("");
    try {
      const feed = await api.getFeed(currentUser.user_id);
      setPosts(feed);
    } catch {
      setError("Couldn't load your feed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  async function handlePost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const tags = tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await api.createPost(currentUser.user_id, { content: content.trim(), tags });
      setContent("");
      setTagsRaw("");
      load();
    } catch {
      setError("Couldn't publish that post. Try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <p className="eyebrow">Feed</p>
          <h1 className="page-title">What's traversing your graph</h1>
        </div>
      </div>

      <form className="panel composer" onSubmit={handlePost}>
        <textarea
          placeholder="Post something into the network…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="composer-footer">
          <input
            className="tag-input"
            placeholder="tags, comma, separated"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
          />
          <button className="btn btn-accent" type="submit" disabled={posting || !content.trim()}>
            {posting ? "Publishing…" : "Publish"}
          </button>
        </div>
      </form>

      {error && <p className="error-text">{error}</p>}

      {loading && !posts && <p className="empty-state">Loading feed…</p>}

      {posts && posts.length === 0 && (
        <div className="panel empty-state">
          <p className="empty-state-title">Nothing here yet</p>
          <p>Follow people from Suggestions to start seeing posts, or be the first to post above.</p>
        </div>
      )}

      {posts && posts.length > 0 && (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.post_id} post={post} authorId={null} />
          ))}
        </div>
      )}
    </div>
  );
}
