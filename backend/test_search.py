from components.weaviate_connection import client
from components.vector_db import search_embeddings
from components.embedding import generate_embeddings_queries

query = "What are the core features"

query_embedding = generate_embeddings_queries(query)

response = search_embeddings(query_embedding, limit = 5)

for result in response:
    print("\n-------------------")
    print("Text:", result.properties["text"])
    print("document_id:", result.properties["document_id"])
    print("Source:", result.properties["source"])
    print("Chunk ID:", result.properties["chunk_id"])


client.close()