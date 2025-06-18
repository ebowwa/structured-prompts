import asyncio
import os
import sys
import pytest
import pytest_asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from gemini_structured_response_prompts_database.database import Database
from gemini_structured_response_prompts_database.models import PromptSchemaDB

@pytest_asyncio.fixture
async def db():
    database = Database(url="sqlite:///:memory:")
    await database.connect()
    try:
        yield database
    finally:
        await database.disconnect()

@pytest.mark.asyncio
async def test_create_and_get_schema(db):
    schema = PromptSchemaDB(
        prompt_id="test_prompt",
        prompt_title="Test",
        main_prompt="Hello?",
        response_schema={"type": "object"},
    )
    await db.create_schema(schema)

    fetched = await db.get_schema("test_prompt")
    assert fetched.prompt_id == "test_prompt"


