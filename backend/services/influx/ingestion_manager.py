from services.influx.client import influx_services
from influxdb_client.client.query_api import QueryApi
from influxdb_client.client.write_api import WriteApi
from influxdb_client import Point
from config import settings
import datetime
import time

class IngestionManager:
    def __init__(self):
        if not influx_services.is_connected():
            raise RuntimeError("InfluxDB client not connected. Call influx_services.connect() first.")
        self.write_api: WriteApi = influx_services.write_api
        self.query_api: QueryApi = influx_services.query_api
        self.bucket = settings.influx_bucket
        self.org = settings.influx_org

    def ingest(self, measurement: str, parsed: dict):
        fields = parsed.get("fields", {})
        tags = parsed.get("tags", {})
        timestamp = parsed.get("timestamp", int(time.time()))

        if not fields:
            print(f"[Ingest] Skipped ingest: no fields in {measurement}")
            return

        point = Point(measurement)
        for k, v in tags.items():
            point.tag(k, v)
        for k, v in fields.items():
            point.field(k, v)
        point.time(datetime.datetime.utcfromtimestamp(timestamp))

        try:
            self.write_api.write(bucket=self.bucket, record=point)
            # print(f"[Ingest] Wrote to {measurement}, fields: {fields}, tags: {tags}, timestamp: {timestamp}")
        except Exception as e:
            print(f"[Ingest] Error writing to {measurement}: {e}")

    def delete_topic(self, topic: str):
        try:
            start = "1970-01-01T00:00:00Z"
            stop = datetime.datetime.utcnow().isoformat() + "Z"
            influx_services.client.delete_api().delete(
                start=start,
                stop=stop,
                predicate=f'_measurement="{topic}"',
                bucket=self.bucket,
                org=self.org
            )
            print(f"[Ingest] Deleted all data for topic/measurement: {topic}")
        except Exception as e:
            print(f"[Delete] Failed to delete topic {topic}: {e}")

# Lazy singleton pattern
_ingestion_manager_instance = None

def get_ingestion_manager():
    global _ingestion_manager_instance
    if _ingestion_manager_instance is None:
        _ingestion_manager_instance = IngestionManager()
    return _ingestion_manager_instance
