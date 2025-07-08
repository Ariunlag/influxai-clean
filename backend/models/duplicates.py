from pydantic import BaseModel
from typing import List, Tuple, Literal

class GraphPoint(BaseModel):
    timestamp: int
    value: float

class DuplicatesResponse(BaseModel):
    data1: List[GraphPoint]
    data2: List[GraphPoint]

class DuplicatePair(BaseModel):
    topics: Tuple[str, str]
    score: float

class ConfirmDuplicateRequest(BaseModel):
    action: Literal['keep', 'delete']
    topics: List[str]