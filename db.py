<<<<<<< HEAD
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
=======
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
>>>>>>> 265882bf299e67546edea3b37a18165c6fa8a344
        print(result.single()["n"])