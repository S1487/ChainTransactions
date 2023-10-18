# Backend Script Example

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
from pydantic import BaseModel
from typing import Any, List
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

'''
@app.get("/getNeighbors/{addressId}")
async def get_neighbors(addressId: str):

    driver = GraphDatabase.driver("neo4j+ssc://7a20fee3.databases.neo4j.io:7687", auth=AUTH)
    query = (
                #"MATCH (w1:wallet {addressId:$addressId}) OPTIONAL MATCH (w1)-[r1:transaction]->(w2:wallet)OPTIONAL MATCH (w3:wallet)-[r2:transaction]->(w1)RETURN w1, r1, w2, r2, w3"
            "MATCH (w:wallet {addressId: $addressId}) OPTIONAL MATCH (from:wallet)-[:TRANSACTION]->(w) WITH w, collect(from) as from OPTIONAL MATCH (w)-[:TRANSACTION]->(to:wallet) WITH w, from, collect(to) as to RETURN w as wallet, from, to"  
        )
    
        # Provide the addressId parameter
    parameters = {"addressId": addressId}
    result = []
    with driver.session() as session:
        result = session.run(query, parameters)
        for record in result:
            wallet = record["wallet"]._properties
            from_wallets = [node._properties for node in record["from"] if node]
            to_wallets = [node._properties for node in record["to"] if node]

            return Wallet(
                wallet=wallet,
                from_wallets=from_wallets,
                to_wallets=to_wallets,
            )
        #graph = result.graph()
        #nodes = list(graph.nodes)
        #relationships = list(graph)
        #return {"nodes": nodes, "relationships": relationships}


'''
class ConnectedWalletsNodesLinksOnly(BaseModel):
    wallet: dict
    from_wallets: List[dict]
    to_wallets: List[dict]



class ConnectedWallets(BaseModel):
    transactions: List[dict]


@app.get("/getNeighbors2/{addressId}", response_model=ConnectedWallets)
async def get_neighbors(addressId: str):
    driver = GraphDatabase.driver("neo4j+ssc://7a20fee3.databases.neo4j.io:7687", auth=AUTH)
    session = driver.session()
    transactions = []  # Initialize outside try for visibility in the entire function scope.
    
    try:
        result = session.run(
            """
            MATCH (w:wallet)-[r:TRANSACTION]-(other:wallet)
            WHERE w.addressId = $addressId
            RETURN r, startNode(r) as source_wallet, endNode(r) as target_wallet
            """,
            {"addressId": addressId},
        )

        for record in result:
            transaction = record["r"]._properties
            source_wallet = record["source_wallet"]._properties
            target_wallet = record["target_wallet"]._properties

            from_wallet = source_wallet if source_wallet["addressId"] == addressId else target_wallet
            to_wallet = target_wallet if source_wallet["addressId"] == addressId else source_wallet

            transactions.append({
                "transaction": transaction,
                "from_wallet": from_wallet,
                "to_wallet": to_wallet
            })

    finally:
        session.close()

    return ConnectedWallets(transactions=transactions)
@app.get("/getNeighborsForLinks/{addressId}", response_model=ConnectedWalletsNodesLinksOnly)
async def getNeighborsForLinks(addressId: str):
    driver = GraphDatabase.driver("neo4j+ssc://7a20fee3.databases.neo4j.io:7687", auth=AUTH)
    session = driver.session()
    try:

        #Returns all links
        result = session.run(
            """
            MATCH (w1:wallet {addressId:$addressId})
            OPTIONAL MATCH (w1)-[r1:TRANSACTION]->(w2:wallet)
            OPTIONAL MATCH (w3:wallet)-[r2:TRANSACTION]->(w1)
            RETURN w1, r1, w2, r2, w3
            """,
            {"addressId": addressId},
        )

        #returns only single link each way

        
        wallet = {}
        from_wallets = []
        to_wallets = []
        to_wallet_list_temp = []
        from_wallet_list_temp = []
        transactions = []
        # Process the results
        for record in result:
            wallet = record["w1"]._properties
            # outgoing transactions
            if record["w2"] and record["r1"]:
                if record['w2'] not in to_wallet_list_temp:
                    to_wallet_list_temp.append(record['w2'])
                    to_wallets.append(record["w2"]._properties)


            # incoming transactions
            if record["w3"] and record["r2"]:
                if record['w3'] not in from_wallet_list_temp:
                    from_wallet_list_temp.append(record['w3'])
                    from_wallets.append(record["w3"]._properties)

        return ConnectedWalletsNodesLinksOnly(
            wallet=wallet,
            from_wallets=from_wallets,
            to_wallets=to_wallets # Return this if you want to include transaction details delete if not
        )

    finally:
        session.close()
'''
    try:
        result = session.run(
            """
            MATCH (w:wallet {addressId: $addressId})
            OPTIONAL MATCH (from:wallet)-[:TRANSACTION]->(w) 
            WITH w, collect(from) as from
            OPTIONAL MATCH (w)-[:TRANSACTION]->(to:wallet) 
            WITH w, from, collect(to) as to
            RETURN w as wallet, from, to
            """,
            {"addressId": addressId},
        )

        # Process the results
        for record in result:
            wallet = record["wallet"]._properties
            from_wallets = [node._properties for node in record["from"] if node]
            to_wallets = [node._properties for node in record["to"] if node]

            return Wallet(
                wallet=wallet,
                from_wallets=from_wallets,
                to_wallets=to_wallets,
            )


    finally:
        if session:
            session.close()
'''
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
