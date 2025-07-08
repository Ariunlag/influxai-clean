import paho.mqtt.client as mqtt
import threading
import socket

from config import settings
from services.mqtt.handler import handle_incoming_message
from services.mqtt.topics import load_topics, save_topics, save_ignored_topics, load_ignored_topics


class MQTTService:
    def __init__(self):
        self.broker = settings.mqtt_broker
        self.port = settings.mqtt_port
        self.client = mqtt.Client()
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.subscribed_topics = load_topics()
        self.ignored_topics = load_ignored_topics()
        self.lock = threading.Lock()
        self.connected = False
        self.loop = None

    def connect(self):
        try:
            # Check if broker is reachable
            print(f"[MQTTService] connect() sees loop: {self.loop!r}")

            with socket.create_connection((self.broker, self.port), timeout=5):
                pass

            self.client.connect(self.broker, self.port)
            self.client.loop_start()
            print(f"[Client] Connected to MQTT broker at {self.broker}:{self.port}")
            self.connected = True

            for topic in self.subscribed_topics:
                self.subscribe(topic)

            print(f"[Client] Resubscribed to {len(self.subscribed_topics)} topics: {self.subscribed_topics}")
        except socket.error as e:
            print(f"[Client] Failed to connect to MQTT broker at {self.broker}:{self.port}. Error: {e}")
            self.connected = False

    def is_connected(self):
        return self.client is not None and self.client.is_connected()

    def set_loop(self, loop):
        self.loop = loop
   
    def subscribe(self, topic: str):
        self.client.subscribe(topic)
        if topic in self.ignored_topics:
            self.ignored_topics.remove(topic)
            save_ignored_topics(self.ignored_topics)
            print(f"[Client] Unignored topic: {topic}")
        if topic not in self.subscribed_topics:
            self.subscribed_topics.add(topic)
            save_topics(self.subscribed_topics)
            print(f"[Client] Subscribed to topic: {topic}")

    def unsubscribe(self, topic: str):
        if topic in self.subscribed_topics:
            self.client.unsubscribe(topic)
            self.subscribed_topics.remove(topic)
            save_topics(self.subscribed_topics)
            print(f"[Client] Unsubscribed from topic: {topic}")
        else:
            self.ignored_topics.add(topic)
            save_ignored_topics(self.ignored_topics)
            print(f"[Client] added to ignored topics: {topic}")

    def _on_connect(self, client, userdata, flags, rc):
        print(f"[Client] MQTT connected with result code {rc}")

    def _on_message(self, client, userdata, msg):

        if msg.topic in self.ignored_topics:
            if not hasattr(self, '_logged_ignored'):
                self._logged_ignored = set()
            if msg.topic not in self._logged_ignored:
                print(f"[Client] Ignored message from topic: {msg.topic}")
                self._logged_ignored.add(msg.topic)
            return
        handle_incoming_message(
            msg.topic,
            msg.payload.decode('utf-8'),
            loop=self.loop
        )

mqtt_service = MQTTService()
