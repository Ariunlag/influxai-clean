import paho.mqtt.client as mqtt
import json
import random
import time


class MQTTPublisher:
    """
    Realistic MQTT publisher:
    - Multiple sensors with realistic small variations.
    - Natural drift for temp/humidity correlation.
    - Typos or mixed-case topics to test semantic similarity.
    """

    def __init__(
        self,
        broker: str,
        port: int,
        towns: list[str],
        homes_per_town: int,
        interval: float = 2.0,
    ):
        self.broker = broker
        self.port = port
        self.towns = towns
        self.homes_per_town = homes_per_town
        self.interval = interval
        self.client = mqtt.Client()
        self.home_state = self._init_home_state()

    def _init_home_state(self):
        state = {}
        for town in self.towns:
            for home_id in range(1, self.homes_per_town + 1):
                key = (town, home_id)
                base_temp = random.uniform(20.0, 25.0)
                state[key] = {
                    "temp_primary": base_temp,
                    "temp_backup": base_temp + random.uniform(-0.5, 0.5),
                    "humidity": random.uniform(40.0, 50.0),
                    "pressure": random.uniform(1000.0, 1020.0),
                }
        return state

    def connect(self):
        self.client.connect(self.broker, self.port)
        print(f"[Publisher] Connected to {self.broker}:{self.port}")

    def publish_sensor_data(self, town: str, home_id: int):
        key = (town, home_id)
        state = self.home_state[key]

        # Small realistic drift: temp sensors drift together
        temp_trend = random.uniform(-0.2, 0.2)
        state["temp_primary"] += temp_trend
        # backup has slight independent noise
        state["temp_backup"] += temp_trend + random.uniform(-0.05, 0.05)

        # Humidity slightly correlated to temp_primary
        hum_trend = temp_trend * 0.5 + random.uniform(-0.2, 0.2)
        state["humidity"] += hum_trend

        # Pressure drifts slowly, less correlated
        state["pressure"] += random.uniform(-0.05, 0.05)

        # Clamp ranges
        temp_primary = round(max(15.0, min(30.0, state["temp_primary"])), 2)
        temp_backup = round(max(15.0, min(30.0, state["temp_backup"])), 2)
        humidity = round(max(30.0, min(70.0, state["humidity"])), 2)
        pressure = round(max(980.0, min(1050.0, state["pressure"])), 2)
        ts = int(time.time())

        base_tags = {
            "home_id": f"home_{home_id:03d}",
            "location": town,
        }

        # Topic variants

        # Primary temperature: correct topic
        topic_primary = f"{town}/home_{home_id:03d}/temperature"
        payload_primary = json.dumps({
            "fields": {"temperature": temp_primary},
            "tags": base_tags,
            "timestamp": ts
        })
        self.client.publish(topic_primary, payload_primary)
        print(f"[Publish] {topic_primary} → {payload_primary}")

        # Backup temperature: typo or casing variant
        typo_topic = f"{town}/home_{home_id:03d}/temprature_backup"  # typo!
        payload_backup = json.dumps({
            "fields": {"temperature": temp_backup},
            "tags": base_tags,
            "timestamp": ts
        })
        self.client.publish(typo_topic, payload_backup)
        print(f"[Publish] {typo_topic} → {payload_backup}")

        # Humidity with uppercase path
        topic_humidity = f"{town.upper()}/HOME_{home_id:03d}/HUMIDITY"
        payload_humidity = json.dumps({
            "fields": {"humidity": humidity},
            "tags": base_tags,
            "timestamp": ts
        })
        self.client.publish(topic_humidity, payload_humidity)
        print(f"[Publish] {topic_humidity} → {payload_humidity}")

        # Pressure normal
        topic_pressure = f"{town}/home_{home_id:03d}/pressure"
        payload_pressure = json.dumps({
            "fields": {"pressure": pressure},
            "tags": base_tags,
            "timestamp": ts
        })
        self.client.publish(topic_pressure, payload_pressure)
        print(f"[Publish] {topic_pressure} → {payload_pressure}")

    def publish_random_data(self):
        while True:
            for town in self.towns:
                for home_id in range(1, self.homes_per_town + 1):
                    self.publish_sensor_data(town, home_id)
            time.sleep(self.interval)

    def start(self):
        self.connect()
        self.publish_random_data()


if __name__ == "__main__":
    mqtt_config = {"broker": "test.mosquitto.org", "port": 1883}
    towns = ["Chicago"]
    homes_per_town = 2
    interval = 5.0  # seconds

    publisher = MQTTPublisher(
        broker=mqtt_config["broker"],
        port=mqtt_config["port"],
        towns=towns,
        homes_per_town=homes_per_town,
        interval=interval,
    )

    try:
        publisher.start()
    except KeyboardInterrupt:
        print("\n[Publisher] Stopped by user.")
