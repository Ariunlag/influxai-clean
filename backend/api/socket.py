import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.websocket.manager import mqtt_socket_manager, duplicate_socket_manager, recommendation_socket_manager

router = APIRouter()

@router.websocket("/ws/mqtt")
async def mqtt_websocket(ws: WebSocket):
    await mqtt_socket_manager.connect(ws)
    print(f"[WebSocket] New connection: {ws.client}")
    try:
        while True:
            msg = await ws.receive_text()
    except WebSocketDisconnect:
        mqtt_socket_manager.disconnect(ws)
        print(f"[WebSocket] Disconnected: {ws.client}")

@router.websocket("/ws/duplicates")
async def duplicate_websocket(ws: WebSocket):
    await duplicate_socket_manager.connect(ws)
    try:
        while True:
            msg = await ws.receive_text() 
    except WebSocketDisconnect:
        duplicate_socket_manager.disconnect(ws)

@router.websocket("/ws/recommendation")
async def recommendation_ws(ws: WebSocket):
    await recommendation_socket_manager.connect(ws)
    try:
        while True:
            data = await ws.receive_text()  # Or just await asyncio.sleep(1) if you don't need it.
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        recommendation_socket_manager.disconnect(ws)