import re
import json
import asyncio
from scipy.stats import pearsonr
from sentence_transformers import SentenceTransformer, util

from .store import duplicate_store
from services.mqtt.message_log import message_log
from services.websocket.manager import duplicate_socket_manager

class DuplicateDetector:
    """
    Two-stage duplicate detection:
      1) Semantic identity (topic+tags embedding)
      2) Value correlation (Pearson r)
    Skips pairs already recorded in the DuplicateStore.
    """
    def __init__(self, id_thresh: float = 0.75, value_thresh: float = 0.95):
        self.id_thresh = id_thresh
        self.value_thresh = value_thresh
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.embeddings = {}  
        self.loop = None     

    def normalize_topic(self, topic: str) -> str:
        t = topic.lower().strip('/')
        t = re.sub(r"[\s\-]+", "_", t)
        while '__' in t:
            t = t.replace('__','_')
        return t

    def identity_text(self, topic: str, tags: dict) -> str:
        # combine normalized topic and sorted tags
        ttext = self.normalize_topic(topic).replace('/', ' ')
        kvs = ' '.join(f"{k.lower()}={v}" for k, v in sorted(tags.items()))
        return f"{ttext} {kvs}"

    def get_embedding(self, topic: str, tags: dict):
        key = (topic, tuple(sorted(tags.items())))
        if key not in self.embeddings:
            txt = self.identity_text(topic, tags)
            self.embeddings[key] = self.model.encode(txt, convert_to_tensor=True)
        return self.embeddings[key]

    def value_correlation(self, vals1: list, vals2: list) -> float:
        # require same length and at least 5 points
        if len(vals1) < 5 or len(vals2) < 5 or len(vals1) != len(vals2):
            return 0.0
        r, _ = pearsonr(vals1, vals2)
        return abs(r)

    async def _notify_ui(self, t1: str, t2: str, id_score: float, corr: float):
        payload = json.dumps({
            'type': 'dup_candidate',
            'topics': [t1, t2],
            'scores': {'identity': id_score, 'correlation': corr}
        })
        conns = len(duplicate_socket_manager.active_connections)
        print(f"[DuplicateDetector] broadcasting to {conns} duplicate‐UI conns → {payload}")
        await duplicate_socket_manager.broadcast(payload)
        print(f"[DuplicateDetector] Notified UI about candidate: {t1} vs {t2} (ID: {id_score}, Corr: {corr})")

    def check_topic(self, new_topic: str):
        """
        Run detection for a single updated topic against all others.
        """
        all_data = message_log.get_all()
        tags_new = all_data[new_topic]['tags']
        vals_new = [v for _, v in all_data[new_topic]['values']]

        for topic, rec in all_data.items():
            if topic == new_topic:
                continue
            # skip already-recorded pairs
            if duplicate_store.exists(new_topic, topic):
                continue
            # 1) identity
            emb1 = self.get_embedding(new_topic, tags_new)
            emb2 = self.get_embedding(topic, rec['tags'])
            id_score = float(util.pytorch_cos_sim(emb1, emb2)[0][0])
            if id_score < self.id_thresh:
                continue
            # 2) value correlation
            vals_old = [v for _, v in rec['values']]
            corr = self.value_correlation(vals_new, vals_old)
            if corr < self.value_thresh:
                continue
            # register and notify
            duplicate_store.add(new_topic, topic, round((id_score + corr)/2, 4))
            
            # schedule UI notification on the main event loop
            if self.loop:
                asyncio.run_coroutine_threadsafe(
                    self._notify_ui(new_topic, topic, id_score, corr),
                    self.loop
                )
            else:
                # fallback if loop not set
                asyncio.run(self._notify_ui(new_topic, topic, id_score, corr))

    def set_loop(self, loop):
        self.loop = loop
   
# Singleton instance
duplicate_detector = DuplicateDetector()
