from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from db import get_session, close_driver
from models import CreateUser, CreatePost, ChatRequest
from chatbot import ask_llm_for_cypher, run_cypher, format_response

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    close_driver()

app = FastAPI(title="Social Graph", lifespan=lifespan)

@app.post("/users", status_code=201)
def create_user(body: CreateUser):
    with get_session() as session:
        session.run("""
            MERGE (u:User {user_id: $user_id})
            SET u.name = $name, u.bio = $bio
        """, body.model_dump())
    return {"status": "ok"}

@app.post("/users/{user_id}/follow/{target_id}")
def follow_user(user_id: str, target_id: str):
    with get_session() as session:
        result = session.run("""
            MATCH (a:User {user_id: $user_id})
            MATCH (b:User {user_id: $target_id})
            MERGE (a)-[:FOLLOWS]->(b)
            RETURN a, b
        """, {"user_id": user_id, "target_id": target_id})
        if not result.single():
            raise HTTPException(404, "One or both users not found")
    return {"status": "ok"}

@app.get("/users/{user_id}/followers")
def get_followers(user_id: str):
    with get_session() as session:
        result = session.run("""
            MATCH (:User {user_id: $uid})<-[:FOLLOWS]-(f:User)
            RETURN f.user_id AS user_id, f.name AS name
        """, {"uid": user_id})
        return [dict(r) for r in result]
    
@app.get("/users/{user_id}/suggestions")
def get_suggestions(user_id: str):
    with get_session() as session:
        result = session.run("""
            MATCH (me:User {user_id: $uid})-[:FOLLOWS]->(friend)-[:FOLLOWS]->(suggestion)
            WHERE suggestion <> me
            AND NOT (me)-[:FOLLOWS]->(suggestion)
            RETURN suggestion.name AS name,
                   suggestion.user_id AS user_id,
                   count(*) AS mutual_count
            ORDER BY mutual_count DESC
            LIMIT 10
        """, {"uid": user_id})
        return [dict(r) for r in result]
    
@app.post("/users/{user_id}/posts", status_code=201)
def create_post(user_id: str, body: CreatePost):
    with get_session() as session:
        result = session.run("""
            MATCH (u:User {user_id: $user_id})
            CREATE (p:Post {
                post_id: randomUUID(),
                content: $content,
                created_at: datetime()
            })
            CREATE (u)-[:POSTED]->(p)
            FOREACH (tag IN $tags |
                MERGE (t:Tag {name: tag})
                MERGE (p)-[:HAS_TAG]->(t)
            )
            RETURN p.post_id AS post_id
        """, {"user_id": user_id, "content": body.content, "tags": body.tags})
        row = result.single()
        if not row:
            raise HTTPException(404, "User not found")
    return {"post_id": row["post_id"]}

@app.get("/users/{user_id}/feed")
def get_feed(user_id: str):
    with get_session() as session:
        result = session.run("""
            MATCH (me:User {user_id: $uid})-[:FOLLOWS]->(followed)-[:POSTED]->(post)
            OPTIONAL MATCH (post)-[:HAS_TAG]->(tag)
            WITH post, followed, collect(tag.name) AS tags
            RETURN post.post_id   AS post_id,
                   post.content   AS content,
                   post.created_at AS created_at,
                   followed.name  AS author,
                   tags
            ORDER BY post.created_at DESC
            LIMIT 20
        """, {"uid": user_id})
        return [dict(r) for r in result]
    
@app.post("/chat")
def chat(body: ChatRequest):
    cypher_response = ask_llm_for_cypher(body.message, body.user_id)

    if not cypher_response.get("cypher"):
        return {"response": "I can only answer questions about the social network graph."}

    results = run_cypher(cypher_response["cypher"], cypher_response.get("params", {}))
    response = format_response(body.message, results, cypher_response["explanation"])

    return {
        "response": response,
        "debug": {
            "cypher": cypher_response["cypher"],
            "params": cypher_response.get("params", {}),
            "raw_results": results
        }
    }