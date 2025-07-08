import json

class RecommendedClassStore:
    """
    Keeps recommended clusters in memory and saves/loads from JSON.
    Each cluster:
      - topics: list of topic strings
      - confidence: float score
      - reason: string explanation
    """

    def __init__(self, filepath='recommendations.json'):
        self.groups = []
        self.filepath = filepath
        self.load()

    def add(self, topics, score, reason):
        self.groups.append({
            "topics": topics,
            "confidence": score,
            "reason": reason
        })
        self.save()

    def get_all(self):
        return self.groups

    def remove_by_topics(self, topics):
        self.groups = [
            g for g in self.groups
            if sorted(g["topics"]) != sorted(topics)
        ]
        self.save()

    def save(self):
        with open(self.filepath, "w") as f:
            json.dump(self.groups, f, indent=2)

    def load(self):
        try:
            with open(self.filepath, "r") as f:
                self.groups = json.load(f)
        except FileNotFoundError:
            self.groups = []

# Singleton
recommended_store = RecommendedClassStore()
