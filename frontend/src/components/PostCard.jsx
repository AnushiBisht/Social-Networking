import { Link } from "react-router-dom";
import NodeAvatar from "./NodeAvatar";

function formatTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function PostCard({ post, authorId }) {
  return (
    <article className="panel post-card">
      <div className="post-head">
        <NodeAvatar id={authorId} name={post.author} size={34} />
        <div>
          {authorId ? (
            <Link to={`/profile/${authorId}`} className="post-author">
              {post.author || authorId}
            </Link>
          ) : (
            <span className="post-author">{post.author}</span>
          )}
          <div className="post-time">{formatTime(post.created_at)}</div>
        </div>
      </div>
      <p className="post-content">{post.content}</p>
      {post.tags && post.tags.length > 0 && (
        <div className="tag-row">
          {post.tags.map((tag) => (
            <span className="tag-chip" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
