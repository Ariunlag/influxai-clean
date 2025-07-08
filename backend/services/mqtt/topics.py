import json
from pathlib import Path

TOPICS_FILE = Path("data/saved_topics.json")
IGNORED_TOPICS_FILE = Path("data/ignored_topics.json")

'''
topics'''
def load_topics() -> set[str]:
    if TOPICS_FILE.exists():
        try:
            with open(TOPICS_FILE, "r") as file:
                return set(json.load(file))
        except Exception as e:
            print(f"[TopicLoader] Failed to load: {e}")
    return set()

def save_topics(topics: set[str]):
    '''
    '''
    try:
        TOPICS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(TOPICS_FILE, "w") as file:
            json.dump(list(topics), file, indent=2)
    except Exception as e:
        print(f"[TopicSaver] Failed to save: {e}")

def clear_topics():
    try:
        if TOPICS_FILE.exists():
            TOPICS_FILE.unlink()
        print("[TopicManager] Cleared all topics")
    except Exception as e:
        print(f"[TopicManager] Failed to clear topics: {e}")

'''
ignored topics
'''
def load_ignored_topics() -> set[str]:
    if IGNORED_TOPICS_FILE.exists():
        try:
            with open(IGNORED_TOPICS_FILE, "r") as file:
                return set(json.load(file))
        except Exception as e:
            print(f"[IgnoredTopicLoader] Failed to load: {e}")
    return set()

def save_ignored_topics(topics: set[str]):
    try:
        IGNORED_TOPICS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(IGNORED_TOPICS_FILE, "w") as file:
            json.dump(list(topics), file, indent=2)
    except Exception as e:
        print(f"[IgnoredTopicSaver] Failed to save: {e}")

def unignore_topic(topic: str):
    try:
        if IGNORED_TOPICS_FILE.exists():
            with open(IGNORED_TOPICS_FILE, "r") as file:
                ignored_topics = set(json.load(file))
            if topic in ignored_topics:
                ignored_topics.remove(topic)
                save_ignored_topics(ignored_topics)
                print(f"[IgnoredTopicManager] Unignored topic: {topic}")
            else:
                print(f"[IgnoredTopicManager] Topic not found in ignored list: {topic}")
    except Exception as e:
        print(f"[IgnoredTopicManager] Failed to unignore topic: {e}")

def clear_ignored_topics():
    try:
        if IGNORED_TOPICS_FILE.exists():
            IGNORED_TOPICS_FILE.unlink()
        print("[IgnoredTopicManager] Cleared all ignored topics")
    except Exception as e:
        print(f"[IgnoredTopicManager] Failed to clear ignored topics: {e}")