from groq import Groq
import os, json
from dotenv import load_dotenv
from db import get_session

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

SCHEMA = """
You are an AI assistant for a social network graph database (Neo4j).

Graph schema:
- (:User {user_id, name, bio})
- (:Post {post_id, content, created_at})
- (:Tag {name})
- (:User)-[:FOLLOWS]->(:User)
- (:User)-[:POSTED]->(:Post)
- (:Post)-[:HAS_TAG]->(:Tag)
- (:User)-[:LIKED]->(:Post)

Your job:
1. Understand the user's question
2. Write a Cypher query to answer it
3. Return ONLY a JSON object in this exact format, nothing else:
{
  "cypher": "MATCH ...",
  "params": {"key": "value"},
  "explanation": "what this query does"
}

Rules:
- Always use $params instead of hardcoding values
- LIMIT results to 10 unless asked otherwise
- If question can't be answered from the graph, set cypher to null
"""


def ask_llm_for_cypher(question: str, user_id: str = None) -> dict:
    user_context = f"The asking user's user_id is: '{user_id}'" if user_id else "No specific user context."

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SCHEMA},
            {"role": "user", "content": f"{user_context}\n\nQuestion: {question}"}
        ]
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown fences if model adds them
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)


def run_cypher(cypher: str, params: dict) -> list[dict]:
    with get_session() as session:
        result = session.run(cypher, params)
        return [dict(record) for record in result]


def format_response(question: str, results: list[dict], explanation: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": f"""
The user asked: "{question}"
The query found: {results}
Query explanation: {explanation}

Write a short, friendly, conversational response answering their question.
If results are empty, say so helpfully.
"""
            }
        ]
    )
    return response.choices[0].message.content.strip()