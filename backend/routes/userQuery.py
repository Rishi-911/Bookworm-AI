from fastapi import APIRouter
from pydantic import BaseModel
from components.embedding import generate_embeddings_queries
from components.vector_db import search_embeddings
from components.generation import generate_answers

router = APIRouter()

class QueryRequest(BaseModel):
    question : str

@router.post("/ask_query")
async def user_query(request : QueryRequest):
    question = request.question
    
    query_embedding = generate_embeddings_queries(question)
    retrieved_chunks = search_embeddings(query_embedding, limit=5)

    answer = generate_answers(question,retrieved_chunks)
    return {
        "answer" : answer
    }

