from components.upload import load_file
from components.chunking import create_chunks
from components.embedding import generateEmbeddings
from components.vector_db import  store_embeddings
from components.weaviate_connection import client

pdf_path = "D:/RAG Project/backend/data/Invoice_Generator.pdf"

document_id = "invoice_generator_001"
source = "Invoice_Generator.pdf"
pages = load_file(pdf_path)

print(f"Pages: {len(pages)}")
chunking = create_chunks(pages)

print(f"Chunks: {len(chunking)}")

embeddings = generateEmbeddings(chunking)

print(f"Embeddings: {len(embeddings)}")

print(f"Embeddings Dimension {len(embeddings[0])}")

print("\nFirst 10 values")

print(embeddings[0][:10])


store_embeddings(
    chunks = chunking,
    embeddings = embeddings,
    document_id = document_id,
    source = source
)

client.close()
# for page in pages:
#     print("\n" + "=" * 50)
#     print(f"page no. {page['page_number']}")
#     print("\n" + "=" * 50)
#     print(page["text"][:1000])

