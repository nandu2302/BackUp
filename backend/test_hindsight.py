import os
from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv()

api_key = os.getenv("HINDSIGHT_API_KEY")
base_url = os.getenv("HINDSIGHT_BASE_URL")

print("Connecting to Hindsight...")

client = Hindsight(
    base_url=base_url,
    api_key=api_key
)

BANK_ID = "project-hindsight"

print("Connected!")

print("Storing test memory...")

client.retain(
    bank_id=BANK_ID,
    content="""
    Project: Emergency Response System.

    During development, the Google Maps API returned
    distance values in meters while our application
    expected kilometers.

    This caused incorrect ETA calculations.

    The team fixed the issue by validating API response
    units and converting meters to kilometers before
    processing.

    Lesson for future projects:
    Always validate units returned by external APIs
    before processing distance-related data.
    """
)

print("Memory stored!")

print("Searching memory...")

result = client.recall(
    bank_id=BANK_ID,
    query="Have we faced problems with external APIs or incorrect distance calculations?"
)

print("\nRelevant memories:")

for memory in result.results:
    print("--------------------------------")
    print(memory.text)

# client.close()
print("\nGenerating Hindsight...")

response = client.reflect(
    bank_id=BANK_ID,
    query="""
    Analyze the project's previous experiences.

    Tell me:
    1. What went wrong?
    2. Why did it happen?
    3. What solution worked?
    4. What should a future project do differently?

    Give the answer as concise project lessons.
    """
)

print("\nPROJECT HINDSIGHT")
print("================")
print(response.text)

client.close()

print("\nDONE!")

