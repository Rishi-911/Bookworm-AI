import os
import weaviate
from dotenv import load_dotenv
from weaviate.classes.init import Auth
load_dotenv()

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_BASE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
)

