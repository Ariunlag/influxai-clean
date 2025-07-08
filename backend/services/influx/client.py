from influxdb_client import InfluxDBClient, Point
from typing import List, Dict, Optional
from config import settings

class InfluxClient:
    def __init__(self):
        self.client = None
        self.write_api = None
        self.query_api = None
        self.connected = False

    def connect(self):
        try:
            self.client = InfluxDBClient(
                url=settings.influx_url,
                token=settings.influx_token,
                org=settings.influx_org
            )
            self.connected = True
            self.write_api = self.client.write_api()
            self.query_api = self.client.query_api()
            
            print("[InfluxClient] Successfully connected to InfluxDB")
        except Exception as e:
            print(f"[InfluxClient] Failed to connect to InfluxDB: {e}")
            self.connected = False

    def is_connected(self):
        return self.client is not None and self.connected

    
    def query(
            self,
            measurements: List[str],
            start: str = "-1h",
            stop: Optional[str] = "now()",
            aggregation: Optional[str] = None,
            window: Optional[str] = None,
            tags: Optional[Dict[str, str]] = None,
            fields: Optional[List[str]] = None
        ) -> list[dict]:
        """
        Reusable Influx query for raw or aggregated time-series.
        - If aggregation & window are provided: aggregate.
        - Else: raw points.
        """
        results = []

        for measurement in measurements:
            flux = f'''
                from(bucket: "{settings.influx_bucket}")
                |> range(start: {start}, stop: {stop})
                |> filter(fn: (r) => r._measurement == "{measurement}")
            '''

            if tags:
                for k, v in tags.items():
                    flux += f'\n|> filter(fn: (r) => r.{k} == "{v}")'

            if fields:
                fields_filter = " or ".join([f'r._field == "{f}"' for f in fields])
                flux += f'\n|> filter(fn: (r) => {fields_filter})'

            if aggregation and window:
                 flux += f'\n|> aggregateWindow(every: {window}, fn: {aggregation}, createEmpty: false)'

            flux += '\n|> yield(name: "result")'

            print(f"[InfluxServices] Running Flux:\n{flux}")

            tables = self.query_api.query(flux)
            points = []
            for table in tables:
                for record in table.records:
                    tags_out = {
                        k: v for k, v in record.values.items()
                        if k not in ["_value", "_time", "_measurement", "_field", "result", "table", "_start", "_stop"]
                    }
                    points.append({
                        "time": record.get_time().isoformat(),
                        "value": record.get_value(),
                        "tags": tags_out or None
                    })

            results.append({
                "measurement": measurement,
                "points": points
            })

        return results

        

influx_services = InfluxClient()
