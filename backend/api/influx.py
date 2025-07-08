# routes/influx_routes.py
from fastapi import APIRouter
from models.influx import (
    MeasurementList,
    Class,
    QueryRequest,
    TimeseriesData
)
from services.influx.metadata import (
    list_measurements,
)
from services.influx.classes import class_store

from services.influx.client import influx_services

from config import settings

router = APIRouter()

@router.get("/measurements", response_model=MeasurementList)
def get_measurements():
    measurements = list_measurements(settings.influx_bucket)
    return {"measurements": measurements}

@router.get("/classes")
def list_classes_route():
    return class_store.load_classes()

@router.post("/classes")
def save_class_route(new_class: Class):
    return class_store.save_classes(new_class.dict())

@router.delete("/classes/{name}")
def delete_class_route(name: str):
    return class_store.delete_classes(name)

@router.post("/query/raw", response_model=list[TimeseriesData])
def query_raw(query: QueryRequest):
    """
    Query raw time-series data from InfluxDB.
    """
    print(f"Querying raw data for measurements: {query.measurements}, start: {query.start}, stop: {query.stop}")
    return influx_services.query(
        measurements=query.measurements,
        start=query.start,
        stop=query.stop,
        aggregation=None,
        window=None
    )

@router.post("/query/aggregated", response_model=list[TimeseriesData])
def query_aggregated(query: QueryRequest):
    """
    Query aggregated time-series data from InfluxDB.
    """
    return influx_services.query(
        measurements=query.measurements,
        start=query.start,
        stop=query.stop,
        aggregation=query.aggregation or "mean",
        window="5m"
    )