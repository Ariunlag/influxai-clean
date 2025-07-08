from fastapi import APIRouter
from services.mqtt.client import mqtt_service
from services.influx.client import influx_services

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "mqtt_connected": mqtt_service.is_connected(),
        "influx_connected": influx_services.is_connected(),
    }
