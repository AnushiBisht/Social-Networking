from neo4j import GraphDatabase
from dotenv import load_dotenv
import os

load_dotenv()

driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
)

def get_session():
    return driver.session()

def close_driver():
    driver.close()

if __name__ == "__main__":
    with get_session() as s:
        result = s.run("RETURN 1 AS n")
        print(result.single()["n"])