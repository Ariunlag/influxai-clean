from fastapi import APIRouter, HTTPException, Query
from typing import List

from services.duplicates.store import duplicate_store
from services.mqtt.message_log import message_log
from services.duplicates.user_decision_handler import handle_user_decision
from models.mqtt import MqttMessage
from models.duplicates import DuplicatePair, ConfirmDuplicateRequest,DuplicatesResponse,GraphPoint

router = APIRouter()

@router.get("/duplicates", response_model=List[DuplicatePair])
async def get_duplicates():
    """
    Retrieve all detected duplicate pairs and their confidence scores.
    """
    try:
        # duplicate_store.all() returns Dict[Tuple[str,str], score]
        raw = duplicate_store.all()
        return [DuplicatePair(topics=pair, score=score or 0.0) for pair, score in raw.items()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving duplicates: {e}")
    
@router.get(
    "/duplicates/data",
    response_model=DuplicatesResponse,
    summary="Fetch the last N points for two topics",
)
async def get_duplicate_data(
    topicA: str = Query(..., description="First topic name"),
    topicB: str = Query(..., description="Second topic name"),
):
    """
    Retrieve up to max_points of MQTT messages for the given duplicate pair.
    """
    # pull both series out of in-memory log
    data1_raw, data2_raw = message_log.get_pair(topicA, topicB)

    # if neither topic has any points, 404
    if not data1_raw and not data2_raw:
        raise HTTPException(404, detail="No data for either topic")

    # build the Pydantic model lists
    data1 = [GraphPoint(timestamp=ts, value=v) for ts, v in data1_raw]
    data2 = [GraphPoint(timestamp=ts, value=v) for ts, v in data2_raw]

    return DuplicatesResponse(data1=data1, data2=data2)

@router.post("/confirm-duplicate")
async def confirm_duplicate(req: ConfirmDuplicateRequest):
    """
    Process user confirmation for detected duplicates.
    action: 'keep' to preserve both streams; 'delete' to remove one.
    topics: list of topic strings to keep or delete (for delete, list length=1).
    """
    print(f"Received request: {req}")
    try:
        result = handle_user_decision(req.action, req.topics)
        return {
            "status": "success",
            "action": req.action,
            "topics": req.topics,
            "details": result,
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
