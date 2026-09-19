from fastapi import UploadFile, File, HTTPException, APIRouter
from components.embedding import generateEmbeddings
from components.vector_db import store_embeddings
from components.chunking import create_chunks
from components.loader import load_file
from uuid import uuid4

router = APIRouter()

@router.post("/upload_file")
async def upload_file(file : UploadFile = File(...)):

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code = 400,
            detail = "Only pdf's are allowed"
        )
    pages = load_file(file)
    source = file.filename
    document_id = str(uuid4())
    chunks = create_chunks(pages)
    embedding = generateEmbeddings(chunks)

    store_embeddings(chunks,embedding, document_id,source)

    return {
        "message" : "PDF processed successfully",
        "document_id" : document_id,
        "source" : source
    }
    