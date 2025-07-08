from pydantic import BaseModel
from typing import List, Literal

class RecommendationGroup(BaseModel):
    topics: List[str]
    confidence: float
    reason: str
    status: Literal['pending', 'approved', 'ignored']