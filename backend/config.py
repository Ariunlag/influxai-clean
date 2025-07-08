# config.py

import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseModel):
    mqtt_broker: str = os.getenv("MQTT_BROKER", "test.mosquitto.org")
    mqtt_port: int = int(os.getenv("MQTT_PORT", 1883))

    influx_url: str = os.getenv("INFLUX_URL", "http://localhost:8086")
    influx_token: str = os.getenv("INFLUX_TOKEN", "V-hSx_wHxSVlhmM43iOSWmBFHy73LF2BsQ-JuASCORSgGwWxO7f9ysBI--A_O8y1dh07YK6khE3t3Bt40pxD7A==")
    influx_org: str = os.getenv("INFLUX_ORG", "Test1")
    influx_bucket: str = os.getenv("INFLUX_BUCKET", "smartHome")


# Create global settings instance
settings = Settings()
