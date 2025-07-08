from pydantic import BaseModel
from typing import List, Literal, Optional, Dict

class MeasurementList(BaseModel):
    measurements: List[str]


class Class(BaseModel):
    name: str
    measurements: List[str]

class QueryRequest(BaseModel):
    measurements: List[str]
    aggregation: Optional[Literal["mean", "max", "min", "sum"]] = "mean"
    start: str
    stop: str

class TimeseriesPoint(BaseModel):
    time: str
    value: float
    tags: Optional[Dict[str, str]] = None

class TimeseriesData(BaseModel):
    measurement: str
    points: List[TimeseriesPoint]

class ClassQueryData(BaseModel):
    class_name: str
    data: List[TimeseriesData]

    