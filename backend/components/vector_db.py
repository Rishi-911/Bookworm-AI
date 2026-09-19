from components.weaviate_connection import client
from weaviate.classes.config import Property, DataType

COLLECTION_NAME = "Documents" 

def create_collection():
    if not client.collections.exists(COLLECTION_NAME):
        collection = client.collections.create(
            COLLECTION_NAME,
            properties = [
                Property(
                    name = "text",
                    data_type = DataType.TEXT
                ),
                Property(
                    name = "document_id",
                    data_type = DataType.TEXT
                ),
                Property(
                    name = "source",
                    data_type = DataType.TEXT
                ),
                Property(
                    name = "chunk_id",
                    data_type = DataType.INT
                ),
                
            ]
                                               
        )
    else:
        collection = client.collections.get(COLLECTION_NAME)

    return collection    


def store_embeddings(chunks,embeddings,document_id, source):
    collection = client.collections.get(COLLECTION_NAME)

    for chunk_id, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        collection.data.insert(
            properties = {
                "text" : chunk["text"],
                "document_id" : document_id,
                "chunk_id" : chunk_id,
                "source" : source
            },
            vector = embedding
        )

    print(f"{len(chunks)} chunks stored successfully")

def search_embeddings(query_embedding, limit=5):
    collection = client.collections.get(COLLECTION_NAME)

    response = collection.query.near_vector(
        near_vector = query_embedding,
        limit=limit,
        return_properties=[
            "text",
            "document_id",
            "source",
            "chunk_id"
        ]

    )
    return response.objects
