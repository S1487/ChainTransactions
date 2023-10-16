# Backend Script Example

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase

# for security reasons
# you can store your database information in a separate file
URI ="neo4j+ssc://7a20fee3.databases.neo4j.io:7687"
AUTH = ("neo4j", "9ZNKuFWZ6D-06eSK4OP_NDeTXt_4_VaVQ4cxK1kOk0w")

app = FastAPI()

origins = ["*"]
#https://community.neo4j.com/t/neo4j-and-fastapi-concurrency/36791


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/getGDBAddr")
async def funcTest():
    driver = GraphDatabase.driver("neo4j+ssc://7a20fee3.databases.neo4j.io:7687", auth=AUTH)
    gdb_address = driver.get_server_info().address
    driver.close()
    driver.verify_connectivity()
    return gdb_address

@app.get("/")
async def funcTest1():
    return "Hello, this is fastAPI data"




def get_driver():
    driver = GraphDatabase.driver("neo4j+ssc://7a20fee3.databases.neo4j.io:7687", auth=AUTH)
    return driver




def do_graph_query(query):
    driver = get_driver()
    with driver.session() as session:
        res = session.run(query['query'], query['parameters'])
        return res


@app.get("/getNeighbors/{addressId}")
async def get_neighbors(addressId: str):

    driver = GraphDatabase.driver("neo4j+ssc://7a20fee3.databases.neo4j.io:7687", auth=AUTH)
    query = (
                "MATCH (w1:wallet {addressId:$addressId}) OPTIONAL MATCH (w1)-[r1:transaction]->(w2:wallet)OPTIONAL MATCH (w3:wallet)-[r2:transaction]->(w1)RETURN w1, r1, w2, r2, w3"
        )

        # Provide the addressId parameter
    parameters = {"addressId": addressId}
    result = []
    with driver.session() as session:
        result = session.run(query, parameters)
        graph = result.graph()
        nodes = list(graph.nodes)
        relationships = list(graph.relationships)
        return {"nodes": nodes, "relationships": relationships}

@app.get("/test/")
async def funcTesttest():
    driver = GraphDatabase.driver("neo4j+ssc://7a20fee3.databases.neo4j.io:7687", auth=AUTH)
    query = "MATCH (n) RETURN count(n) AS nodeCount"

    # Initialize a session
    with driver.session() as session:
        result = session.run(query)

        # Retrieve the count from the query result
        data_count = result.single().get("nodeCount")

        return data_count
