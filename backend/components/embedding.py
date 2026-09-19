import os
from dotenv import load_dotenv

from openai import OpenAI

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = os.getenv("OPENROUTER_BASE_URL")

client = OpenAI(
    api_key = API_KEY,
    base_url = BASE_URL
)

def generateEmbeddings(chunks):
    texts = [chunk["text"] for chunk in chunks]

    response = client.embeddings.create(
        model = "google/gemini-embedding-001",
        input = texts
    )

    embeddings = [
        item.embedding
        for item in response.data

    ]

    return embeddings

def generate_embeddings_queries(query):
    response = client.embeddings.create(
    model = "google/gemini-embedding-001",
    input = query
    )
    return response.data[0].embedding    
