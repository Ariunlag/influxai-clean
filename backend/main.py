# backend/main.py

import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.mqtt import router as mqtt_router
from api.health import router as health_router
from api.socket import router as socket_router
from api.duplicates import router as duplicates_router
from api.influx import router as influx_router
from api.recommendation import router as recommendation_router

from services.mqtt.client import mqtt_service
from services.influx.client import influx_services
from services.duplicates.detector import duplicate_detector 
from services.recommendation.detector import recommendation_detector

app = FastAPI()

async def periodic_recommendations():
    while True:
        print("[Periodic] Running RecommendationDetector.check_all()")
        recommendation_detector.check_all()
        await asyncio.sleep(20)

@app.on_event("startup")
async def startup_event():
    
    loop = asyncio.get_running_loop()
    print(f"[Startup] got running loop: {loop!r} (id={id(loop)})")

    mqtt_service.set_loop(loop)
    duplicate_detector.set_loop(loop)
    recommendation_detector.set_loop(loop)

    mqtt_service.connect()
    influx_services.connect()

    loop.create_task(periodic_recommendations())

# CORS, routers, root, etc.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mqtt_router, prefix="/api")
app.include_router(health_router, prefix="/api")
app.include_router(duplicates_router, prefix="/api")
app.include_router(influx_router, prefix="/api")
app.include_router(recommendation_router, prefix="/api")


app.include_router(socket_router)


@app.get("/")
def root():
    return {"message": "Backend started and services connected"}

@app.on_event("shutdown")
def shutdown_event():
    print("[Shutdown] Closing MQTT client and InfluxDB client")
    mqtt_service.disconnect()
    influx_services.client.close()
    print("[Shutdown] All services disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True) 
 