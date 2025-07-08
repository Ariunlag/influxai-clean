import json
from pathlib import Path
from collections import defaultdict, OrderedDict
from time import time
import atexit

class MessageLog:
    SAVE_PATH = Path("data/dupe_message_log.json")

    def __init__(self, max_points=100, auto_save=False):
        self._data = defaultdict(lambda: {
            "tags": {},
            "values": OrderedDict()
        })
        self._max_points = max_points
        self._auto_save = auto_save

        self._load_from_file()
        atexit.register(self._save_to_file)

    def add(self, topic: str, value: float, tags: dict = None, timestamp: int = None) -> bool:
        if timestamp is None:
            timestamp = int(time())
        entry = self._data[topic]

        if tags and not entry["tags"]:
            entry["tags"] = tags

        if timestamp in entry["values"]:
            return False  # Duplicate

        entry["values"][timestamp] = value
        while len(entry["values"]) > self._max_points:
            entry["values"].popitem(last=False)

        if self._auto_save:
            self._save_to_file()

        return True

    def get(self, topic: str):
        return self._data.get(topic)

    def get_all(self):
        return {
            topic: {
                "tags": entry["tags"],
                "values": list(entry["values"].items())
            } for topic, entry in self._data.items()
        }

    def get_pair(self, topicA: str, topicB: str):
        a = self.get(topicA)
        b = self.get(topicB)
        data1 = list(a["values"].items()) if a else []
        data2 = list(b["values"].items()) if b else []
        return data1, data2

    def clear(self):
        self._data.clear()
        print("[MessageLog] Cleared all data.")

    def _load_from_file(self):
        if self.SAVE_PATH.exists():
            try:
                with open(self.SAVE_PATH, "r") as f:
                    data = json.load(f)
                for topic, entry in data.items():
                    tags = entry.get("tags", {})
                    for ts, val in entry.get("values", []):
                        self.add(topic, val, tags=tags, timestamp=int(ts))
                print("[MessageLog] Loaded from file.")
            except Exception as e:
                print(f"[MessageLog] Failed to load from file: {e}")

    def _save_to_file(self):
        try:
            data = self.get_all()
            self.SAVE_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(self.SAVE_PATH, "w") as f:
                json.dump(data, f, indent=2)
            print("[MessageLog] Saved to file.")
        except Exception as e:
            print(f"[MessageLog] Failed to save to file: {e}")

    def reload_from_disk(self):
        self._data.clear()
        self._load_from_file()

    def force_save(self):
        self._save_to_file()


# Instantiate singleton
message_log = MessageLog(max_points=100, auto_save=False)
