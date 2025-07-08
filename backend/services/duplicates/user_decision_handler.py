from services.mqtt.message_log import message_log
from services.duplicates.store import duplicate_store
from services.mqtt.client import mqtt_service
from services.influx.ingestion_manager import get_ingestion_manager


def handle_user_decision(action: str, topics: list):
    """
    Process user actions on duplicate candidates:
      - 'keep': record pairs as resolved so they won't re-alert
      - 'delete': unsubscribe, purge data, and remove from memory
    """
    if action == 'keep':
        # record each pair to ignore in future
        for i in range(len(topics)):
            for j in range(i + 1, len(topics)):
                duplicate_store.add(topics[i], topics[j], score=None)
    elif action == 'delete':
        # expect topics = [topic_to_delete]
        t_del = topics[0]
        # 1) unsubscribe from MQTT
        mqtt_service.unsubscribe(t_del)

        # 2) delete history from Influx
        get_ingestion_manager().delete_topic(t_del)

        # 3) remove from in-memory log
        if message_log.get(t_del):
            del message_log._data[t_del]
        # 4) remove any duplicate pairs involving this topic
        duplicate_store._store = {
            k: v for k, v in duplicate_store._store.items() if t_del not in k
        }
    else:
        print(f"[UserDecision] Unknown action: {action}")
