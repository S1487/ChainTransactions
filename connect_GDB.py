from neo4j import GraphDatabase


class GraphDB:

    def __init__(self):

        uri = "neo4j+s://7a20fee3.databases.neo4j.io"
        user = "neo4j"
        password = "9ZNKuFWZ6D-06eSK4OP_NDeTXt_4_VaVQ4cxK1kOk0w"
        URI ="neo4j+ssc://7a20fee3.databases.neo4j.io"
        AUTH = ("neo4j", "9ZNKuFWZ6D-06eSK4OP_NDeTXt_4_VaVQ4cxK1kOk0w")
        
        self.driver = GraphDatabase.driver(URI, auth=AUTH)
        print("Neo4j GDB address:", self.driver.get_server_info().address)

    def close(self):
        self.driver.close()


if __name__ == "__main__":
    GDB = GraphDB()
    GDB.close()