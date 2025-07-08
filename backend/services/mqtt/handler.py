import json
import asyncio
from time import time

from services.websocket.manager import mqtt_socket_manager
from services.mqtt.message_log import message_log
from services.influx.ingestion_manager import get_ingestion_manager
from services.duplicates.detector import duplicate_detector

async def broadcast_message(topic: str, parsed: dict):
    payload = {
        "topic": topic,
        "data": parsed
    }
    await mqtt_socket_manager.broadcast_json(payload)

def handle_incoming_message(topic: str, payload: str, loop: asyncio.AbstractEventLoop | None = None):
    """
    MQTT handler: parses payload, dedupes, logs data, checks duplicates, and ingests to Influx.
    """

    try:
        parsed = json.loads(payload)
    except json.JSONDecodeError:
        return

    fields    = parsed.get('fields', {})
    tags      = parsed.get('tags', {})
    timestamp = parsed.get('timestamp', int(time()))
    value     = next(iter(fields.values()), None)

    if value is None:
        return
        
    # 1) Dedupe in-memory; only proceed if it's new
    is_new = message_log.add(topic, value, tags, timestamp)
    if not is_new:
        return

    # 2) Run duplicate-detection on the fresh point
    duplicate_detector.check_topic(topic)

    # 3) Persist to Influx
    get_ingestion_manager().ingest(topic, parsed)

    # 4) Broadcast to WebSocket clients
    if loop :
        try:
            asyncio.run_coroutine_threadsafe(broadcast_message(topic, parsed), loop)
        except Exception as e:
            print(f"[MQTT Handler] Error broadcasting message: {e}")