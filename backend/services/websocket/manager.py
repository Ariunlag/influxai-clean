from typing import List
from fastapi import WebSocket, WebSocketDisconnect

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for ws in self.active_connections.copy():
            try:
                await ws.send_text(message)
            except WebSocketDisconnect:
                self.disconnect(ws)

    async def broadcast_json(self, obj):
        for ws in self.active_connections.copy():
            try:
                await ws.send_json(obj)
            except WebSocketDisconnect:
                self.disconnect(ws)

mqtt_socket_manager     = WebSocketManager()
duplicate_socket_manager = WebSocketManager()
recommendation_socket_manager = WebSocketManager()