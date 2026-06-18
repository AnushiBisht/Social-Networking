# Social Network Graph

A social network backend built with **FastAPI**, **Neo4j**, and an **AI chatbot** powered by Groq (Llama 3). Users can follow each other, post content, and get AI-driven insights about the graph.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python + FastAPI |
| Database | Neo4j (AuraDB) |
| AI Chatbot | Groq API (Llama 3.3 70B) |
| Server | Uvicorn |

---

## Features

- Create users and follow/unfollow each other
- Create posts with tags
- Like posts
- Personalized feed from followed users
- "People you may know" suggestions (friends of friends)
- AI chatbot that answers natural language questions about the graph

---

## Graph Model

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

## Project Structure

```
social-network/
├── .env.example
├── requirements.txt
├── db.py          # Neo4j driver setup
├── models.py      # Pydantic request models
├── chatbot.py     # Groq AI + Cypher generation
└── main.py        # FastAPI routes
```

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/social-network-graph.git
cd social-network-graph
```

### 2. Create virtual environment

```bash
python -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up Neo4j

Create a free instance at [neo4j.com/cloud/platform/aura-graph-database](https://neo4j.com/cloud/platform/aura-graph-database).

Save your credentials — the password is only shown once.

### 5. Get Groq API key

Sign up at [console.groq.com](https://console.groq.com) and create an API key. Free tier gives 14,400 requests/day.

### 6. Configure environment

```bash
cp .env.example .env
```

Fill in your `.env`:

```
NEO4J_URI=neo4j+ssc://xxxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password

GROQ_API_KEY=gsk_xxxxx
```

### 7. Run the server

```bash
uvicorn main:app --reload
```

API docs available at `http://localhost:8000/docs`

---

## API Endpoints

### Users

| Method | Endpoint | Description |
|---|---|---|
| POST | `/users` | Create a user |
| POST | `/users/{user_id}/follow/{target_id}` | Follow a user |
| GET | `/users/{user_id}/followers` | Get followers |
| GET | `/users/{user_id}/suggestions` | People you may know |

### Posts

| Method | Endpoint | Description |
|---|---|---|
| POST | `/users/{user_id}/posts` | Create a post |
| GET | `/users/{user_id}/feed` | Get feed from followed users |

### Chatbot

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | Ask a natural language question about the graph |

---

## Chatbot Examples

The AI chatbot translates natural language into Cypher queries and returns human-friendly answers.

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

```json
POST /chat
{
  "message": "What are the trending tags?",
  "user_id": null
}
```

The response includes a `debug.cypher` field showing the exact query that was generated — useful for learning Neo4j.

---

## How the Chatbot Works

```
User message
    → Groq (Llama 3) generates Cypher query
    → Query runs on Neo4j
    → Groq formats results into plain English
    → Response returned
```

---

## How Recommendations Work

Friend suggestions use a 2-hop graph traversal:

```cypher
MATCH (me:User {user_id: $uid})-[:FOLLOWS]->(friend)-[:FOLLOWS]->(suggestion)
WHERE suggestion <> me
AND NOT (me)-[:FOLLOWS]->(suggestion)
RETURN suggestion.name, count(*) AS mutual_count
ORDER BY mutual_count DESC
```

This is the core advantage of graph databases — queries like this are natural and fast, whereas in SQL they'd require multiple nested JOINs.

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
