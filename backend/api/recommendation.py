from fastapi import APIRouter, HTTPException, Request

from services.recommendation.store import recommended_store
from services.recommendation.actions import handle_recommendation_confirmation
from services.mqtt.message_log import message_log
from services.influx.client import influx_services


router = APIRouter()

@router.get("/recommendations")
def get_recommendations():
    print("[Backend] /recommendations called")
    return {"recommendations": recommended_store.get_all()}

@router.post("/confirm-recommendation")
def confirm_recommendation(data: dict):
    print("[Backend] /confirm-recommendation called with:", data)
    topics = data.get("topics")
    action = data.get("action")
    class_name = data.get("class_name")  # ✅

    if not topics or action not in ["approve", "ignore"]:
        raise HTTPException(status_code=400, detail="Invalid input.")

    result = handle_recommendation_confirmation(topics, action, class_name)
    return {"status": "success", "result": result}


@router.post("/recommendations-data")
def get_recommendations_data(data: dict):
    topics = data.get("topics", [])
    if not topics:
        raise HTTPException(status_code=400, detail="No topics provided.")

    if not influx_services.is_connected():
        raise HTTPException(status_code=500, detail="InfluxDB not connected.")

    print("[Backend] /recommendations-data topics:", topics)

    # 🟢 Just pass your topics (measurements) — no aggregation!
    results = influx_services.query(
        measurements=topics,
        start="-1h",   # Or whatever time window you need
        aggregation=None,
        window=None
    )

    return results

@router.get("/message-log")
def get_message_log():
    data = message_log.get_all()
    print("[Backend] /message-log →", list(data.keys()))
    return data