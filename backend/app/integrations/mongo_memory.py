"""
Purpose: MongoDB case memory integration with in-memory fallback.
Ownership: Jules
Safety: Stores cases and feedback. Falls back to in-memory if DB is missing.
"""
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from ..schemas.models import Case, Feedback
from typing import List, Optional

logger = logging.getLogger(__name__)

class MongoCaseMemory:
    def __init__(self, database_url: str = None):
        self.url = database_url or os.getenv("DATABASE_URL", "mongodb://localhost:27017/wazcor")
        self.in_memory_cases = {}
        try:
            self.client = AsyncIOMotorClient(self.url, serverSelectionTimeoutMS=2000)
            self.db = self.client.wazcor
            self.cases = self.db.cases
            self.use_db = True
        except Exception as e:
            logger.warning(f"Failed to connect to MongoDB: {e}. Using in-memory fallback.")
            self.use_db = False

    async def store_case(self, case: Case):
        if self.use_db:
            try:
                await self.cases.update_one(
                    {"id": case.id},
                    {"$set": case.model_dump()},
                    upsert=True
                )
                return
            except Exception as e:
                logger.error(f"DB Error: {e}. Falling back to in-memory.")
                self.use_db = False

        self.in_memory_cases[case.id] = case.model_dump()

    async def get_case(self, case_id: str) -> Optional[Case]:
        if self.use_db:
            try:
                data = await self.cases.find_one({"id": case_id})
                if data:
                    return Case(**data)
            except Exception as e:
                logger.error(f"DB Error: {e}")

        data = self.in_memory_cases.get(case_id)
        if data:
            return Case(**data)
        return None

    async def get_all_cases(self) -> List[Case]:
        if self.use_db:
            try:
                cursor = self.cases.find().sort("created_at", -1)
                return [Case(**c) async for c in cursor]
            except Exception as e:
                logger.error(f"DB Error: {e}")

        sorted_cases = sorted(self.in_memory_cases.values(), key=lambda x: x['created_at'], reverse=True)
        return [Case(**c) for c in sorted_cases]

    async def add_feedback(self, case_id: str, feedback: Feedback):
        if self.use_db:
            try:
                await self.cases.update_one(
                    {"id": case_id},
                    {"$set": {"feedback": feedback.model_dump()}}
                )
                return
            except Exception as e:
                logger.error(f"DB Error: {e}")

        if case_id in self.in_memory_cases:
            self.in_memory_cases[case_id]["feedback"] = feedback.model_dump()
