from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key = os.getenv("OPENROUTER_API_KEY"),
    base_url = os.getenv("OPENROUTER_BASE_URL")
)


def generate_answers(query, retrieved_chunks):
    context = "\n\n".join(
        result.properties["text"]
        for result in retrieved_chunks
    )

    prompt = f"""" 
    You are a helpful assistant answer the questions based on the provided context

    Context:
    {context}

    Question
    {query}

    Instructions:
    - Answer the questions based on the provided context only
    - If the answer is not present in the context, say that you don't know
    - Do not give the generalise answer 
    """

    response = client.chat.completions.create(
        model = "openai/gpt-4o-mini",
        messages = [
            {
                "role" : "user",
                "content" : prompt
            }
        ]
    )
    return response.choices[0].message.content