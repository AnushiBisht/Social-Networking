const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* no json body */
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  createUser: (user) =>
    request("/users", { method: "POST", body: JSON.stringify(user) }),

  getProfile: (userId) => request(`/users/${encodeURIComponent(userId)}/profile`),

  followUser: (userId, targetId) =>
    request(`/users/${encodeURIComponent(userId)}/follow/${encodeURIComponent(targetId)}`, {
      method: "POST",
    }),

  getFollowers: (userId) => request(`/users/${encodeURIComponent(userId)}/followers`),

  getSuggestions: (userId) => request(`/users/${encodeURIComponent(userId)}/suggestions`),

  createPost: (userId, post) =>
    request(`/users/${encodeURIComponent(userId)}/posts`, {
      method: "POST",
      body: JSON.stringify(post),
    }),

  getFeed: (userId) => request(`/users/${encodeURIComponent(userId)}/feed`),

  chat: (message, userId) =>
    request("/chat", {
      method: "POST",
      body: JSON.stringify({ message, user_id: userId || null }),
    }),
};

export { ApiError };
