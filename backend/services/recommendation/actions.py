from .store import recommended_store
from services.influx.classes import class_store

def handle_recommendation_confirmation(topics: list, action: str, class_name: str | None = None):
    print(f"[Actions] handle_recommendation_confirmation: {action=} {topics=} {class_name=}")

    # ✅ Remove the cluster from the in-memory + JSON store
    recommended_store.remove_by_topics(topics)

    # ✅ Save as class if requested
    if action == "approve" and class_name:
        class_store.add(name=class_name, topics=topics)
        class_store.save()

    return f"Cluster with topics {topics} {action}d."
