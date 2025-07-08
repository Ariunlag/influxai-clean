# services/influx/class_store.py

import json
from pathlib import Path

CLASSES_FILE = Path("data/classes.json")

class ClassStore:
    def __init__(self):
        self._classes = []
        self.load()

    def load(self):
        if CLASSES_FILE.exists():
            with open(CLASSES_FILE) as f:
                self._classes = json.load(f)
        else:
            self._classes = []
        print(f"[ClassStore] Loaded {len(self._classes)} classes.")

    def add(self, name: str, topics: list[str]):
        if any(c["name"] == name for c in self._classes):
            print(f"[ClassStore] Class '{name}' already exists. Skipping add.")
            return

        new_class = {"name": name, "measurements": topics}
        self._classes.append(new_class)
        print(f"[ClassStore] Added new class: {new_class}")

    def save(self):
        with open(CLASSES_FILE, "w") as f:
            json.dump(self._classes, f, indent=2)
        print(f"[ClassStore] Saved {len(self._classes)} classes to {CLASSES_FILE}")

    def delete(self, name: str):
        before = len(self._classes)
        self._classes = [c for c in self._classes if c["name"] != name]
        self.save()
        print(f"[ClassStore] Deleted '{name}' (before: {before}, after: {len(self._classes)})")

    def get_all(self):
        return self._classes

# ✅ Singleton instance
class_store = ClassStore()
