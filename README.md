# Social Networking

A social network built on a graph database. **FastAPI + Neo4j** on the backend, a **React + Vite** frontend, and a natural-language chatbot (Groq / Llama 3.3) that turns plain-English questions into Cypher queries against the graph.

---

## Tech stack

| Layer      | Technology                     |
| ---------- | ------------------------------- |
| Backend    | Python + FastAPI                |
| Database   | Neo4j (AuraDB)                  |
| Frontend   | React + Vite                    |
| AI chatbot | Groq API (Llama 3.3 70B)        |
| Server     | Uvicorn                         |

---

## Features

- Create users, follow other users
- Create posts with tags
- Personalized feed from people you follow
- "People you may know" suggestions via 2-hop friend-of-friend traversal
- Natural-language chatbot that generates and runs Cypher queries against the graph, with the generated query visible in the response

> **Not implemented yet:** unfollowing, liking posts (the `LIKED` relationship exists in the schema but has no endpoint), and user search/listing. See [Known limitations](#known-limitations).

---

## Graph model

```
(:User {user_id, name, bio})
(:Post {post_id, content, created_at})
(:Tag {name})

(:User)-[:FOLLOWS]->(:User)
(:User)-[:POSTED]->(:Post)
(:User)-[:LIKED]->(:Post)
(:Post)-[:HAS_TAG]->(:Tag)
```

---

## Project structure

```
social-networking/
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── db.py          # Neo4j driver setup
│   ├── models.py      # Pydantic request models
│   ├── chatbot.py     # Groq AI + Cypher generation
│   └── main.py         # FastAPI routes
└── frontend/
    ├── .env.example
    ├── package.json
    └── src/
        ├── api.js              # thin fetch wrapper around the API
        ├── context/             # local "who am I" identity, stored in localStorage
        ├── components/
        └── pages/
            ├── Feed.jsx
            ├── Suggestions.jsx
            ├── Ask.jsx          # chatbot UI with visible generated Cypher
            └── Profile.jsx
```

(Adjust the folder names above to match how you've actually laid out the repo — the backend files currently live at the repo root; move them into `backend/` or drop the `frontend/` folder in alongside them, whichever you prefer.)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/AnushiBisht/Social-Networking.git
cd Social-Networking
```

### 2. Backend

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a free Neo4j instance at [neo4j.com/cloud/platform/aura-graph-database](https://neo4j.com/cloud/platform/aura-graph-database) and save the credentials (the password is only shown once). Get a Groq API key at [console.groq.com](https://console.groq.com).

```bash
cp env.example .env
```

Fill in `.env`:

```
NEO4J_URI=neo4j+ssc://xxxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
GROQ_API_KEY=gsk_xxxxx
```

Run it:

```bash
uvicorn main:app --reload
```

API docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_URL if the backend isn't on localhost:8000
npm run dev
```

Runs at `http://localhost:5173`, which matches the CORS origin already configured in `main.py`. There's no auth system — on first load you enter or create a `user_id` and it's remembered in `localStorage`.

---

## API endpoints

### Users

| Method | Endpoint                              | Description          |
| ------ | -------------------------------------- | --------------------- |
| POST   | `/users`                               | Create a user         |
| POST   | `/users/{user_id}/follow/{target_id}`  | Follow a user         |
| GET    | `/users/{user_id}/followers`           | Get followers         |
| GET    | `/users/{user_id}/suggestions`         | People you may know   |
| GET    | `/users/{user_id}/profile`             | Profile + their posts |

### Posts

| Method | Endpoint                  | Description                   |
| ------ | -------------------------- | ------------------------------ |
| POST   | `/users/{user_id}/posts`  | Create a post                  |
| GET    | `/users/{user_id}/feed`   | Feed from followed users       |

### Chatbot

| Method | Endpoint | Description                                      |
| ------ | -------- | ------------------------------------------------- |
| POST   | `/chat`  | Ask a natural-language question about the graph   |

---

## Chatbot examples

The chatbot translates natural language into a Cypher query, runs it, and turns the result into a plain-English answer.

```json
POST /chat
{
  "message": "Who are the most followed users?",
  "user_id": null
}
```

```json
POST /chat
{
  "message": "Who should I follow?",
  "user_id": "alice"
}
```

The response includes a `debug.cypher` field with the exact query that was generated — the frontend's Ask page surfaces this in a "view query" toggle.

```
User message
    → Groq (Llama 3.3) generates a Cypher query
    → Query runs against Neo4j
    → Groq turns the results into a plain-English reply
    → Response (+ the raw Cypher) returned to the client
```

---

## How recommendations work

Friend suggestions use a 2-hop graph traversal:

```cypher
MATCH (me:User {user_id: $uid})-[:FOLLOWS]->(friend)-[:FOLLOWS]->(suggestion)
WHERE suggestion <> me
AND NOT (me)-[:FOLLOWS]->(suggestion)
RETURN suggestion.name, count(*) AS mutual_count
ORDER BY mutual_count DESC
```

This is the kind of query graph databases are built for — a friend-of-a-friend lookup that reads naturally as a single pattern match, versus several nested joins in SQL.

---

## Known limitations

- No `unfollow` endpoint — following is currently one-directional and permanent via the API.
- No `like` endpoint, despite the `LIKED` relationship existing in the schema.
- No user search or listing endpoint — the frontend works around this with a manual "jump to user_id" field.
- `/feed` returns each post's author name but not their `user_id`, so author names in the feed aren't clickable (posts on a profile page are, since the ID is already known there).
- No authentication — `user_id` is self-declared by whoever calls the API.

---

## Requirements

```
fastapi
uvicorn
neo4j
groq
python-dotenv
pydantic
```

---

## License

MIT
