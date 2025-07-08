class DuplicateStore:
    """
    Central registry for detected duplicate topic pairs.
    Stores each pair as a frozenset mapped to a confidence score.
    """
    def __init__(self):
        # { frozenset({topic1, topic2}): score }
        self._store = {}

    def add(self, t1: str, t2: str, score: float = None):
        """
        Register a duplicate relationship between t1 and t2 with an optional score.
        """
        key = frozenset({t1, t2})
        self._store[key] = score
        print(f"[DuplicateStore] Registered duplicate: {t1} <-> {t2} (score={score})")

    def exists(self, t1: str, t2: str) -> bool:
        """
        Check if the pair t1, t2 is already recorded.
        """
        return frozenset({t1, t2}) in self._store

    def all(self):
        """
        Return all stored duplicate pairs and their scores.
        """
        return {tuple(k): v for k, v in self._store.items()}

    def clear(self):
        """
        Clears all recorded duplicate relationships.
        """
        self._store.clear()
        print("[DuplicateStore] Cleared all entries.")

# Singleton instance
duplicate_store = DuplicateStore()
