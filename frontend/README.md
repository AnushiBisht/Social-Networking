# Node — frontend

A Vite + React frontend for your Neo4j-backed social graph API.

## Setup

```bash
npm install
cp .env.example .env   # edit VITE_API_URL if your backend isn't on localhost:8000
npm run dev
```

This runs on `http://localhost:5173`, which matches the CORS origin already
allowed in your FastAPI `main.py`. Make sure the backend is running
(`uvicorn main:app --reload`) before you load the app.

## How identity works

There's no auth system in the backend, so "logging in" here just means
telling the app which `user_id` you are. On first visit you can either:

- **I have an ID** — enter an existing `user_id` to resume as that user.
- **New here** — create a brand new user (calls `POST /users`).

The chosen identity is kept in `localStorage` on your machine.

## Pages

- **Feed** (`/feed`) — posts from people you follow, plus a composer to publish new posts with tags.
- **Suggestions** (`/suggestions`) — people-you-may-know, rendered as graph edges weighted by mutual-connection count (this maps directly to your `/suggestions` Cypher query).
- **Ask** (`/ask`) — natural-language chat backed by `/chat`. Each answer has a "view query" toggle that reveals the actual Cypher the LLM generated, since that's what makes this app different from a static feed.
- **Profile** (`/profile/:userId`) — any user's bio, posts, and follower count, with a follow button and a "jump to user_id" field since there's no user search endpoint yet.

## Known backend gaps this frontend works around

- No `unfollow` endpoint — the follow button is one-directional.
- No user search/listing endpoint — profile page includes a manual "jump to user_id" field.
- `/feed` doesn't return the author's `user_id`, only their name, so author names in the feed aren't clickable links (only posts on a profile page are).
