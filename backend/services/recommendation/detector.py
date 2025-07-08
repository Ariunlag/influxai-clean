import json
import asyncio
from collections import deque
import networkx as nx
import numpy as np
from sentence_transformers import util

from services.common.utils import normalize_topic, value_correlation
from services.common.embedding_model import embedding_model
from services.mqtt.message_log import message_log
from services.websocket.manager import recommendation_socket_manager
from .store import recommended_store


class RecommendationDetector:
    """
    Batch recommendation detector:
    - Finds overlapping pairs
    - Merges them into clusters
    - Prints exactly why pairs pass/skip
    - Tells you if not enough pairs exist yet
    """

    def __init__(self, id_thresh=0.3, corr_thresh=0.2, history_size=5000, percentile=50.0):
        self.id_thresh = id_thresh
        self.corr_thresh = corr_thresh
        self.topic_cache = {}
        self.tags_cache = {}
        self.scores = deque(maxlen=history_size)
        self.percentile = percentile
        self.loop = None

    def topic_text(self, topic):
        return normalize_topic(topic).replace('/', ' ')

    def tags_text(self, tags):
        keys = sorted(tags.keys())
        return ' '.join(keys)

    def get_topic_embedding(self, topic):
        if topic not in self.topic_cache:
            txt = self.topic_text(topic)
            self.topic_cache[topic] = embedding_model.encode(txt, convert_to_tensor=True)
        return self.topic_cache[topic]

    def get_tags_embedding(self, topic, tags):
        if topic not in self.tags_cache:
            txt = self.tags_text(tags)
            self.tags_cache[topic] = embedding_model.encode(txt, convert_to_tensor=True)
        return self.tags_cache[topic]

    def compute_semantic_score(self, t1, t2, tags1, tags2):
        emb_t1 = self.get_topic_embedding(t1)
        emb_t2 = self.get_topic_embedding(t2)
        emb_k1 = self.get_tags_embedding(t1, tags1)
        emb_k2 = self.get_tags_embedding(t2, tags2)
        sim_topic = float(util.pytorch_cos_sim(emb_t1, emb_t2)[0][0])
        sim_tags  = float(util.pytorch_cos_sim(emb_k1, emb_k2)[0][0])
        return (sim_topic + sim_tags) / 2.0

    def compute_behaviour_score(self, vals1, vals2):
        return value_correlation(vals1, vals2)

    def dynamic_threshold(self):
        if len(self.scores) >= 200:
            return float(np.percentile(self.scores, self.percentile))
        return self.id_thresh

    async def _notify_ui(self, topics, score, reason):
        payload = json.dumps({
            'type': 'recommendation',
            'topics': topics,
            'confidence': score,
            'reason': reason
        })
        print(f"[Recommender] Notifying UI → {payload}")
        await recommendation_socket_manager.broadcast(payload)

    def merge_clusters(self, pairs):
        G = nx.Graph()
        for t1, t2 in pairs:
            G.add_edge(t1, t2)
        for t in message_log.get_all().keys():
            if t not in G:
                G.add_node(t)
        clusters = [list(comp) for comp in nx.connected_components(G)]
        print(f"[Recommender] Merged into {len(clusters)} clusters")
        return clusters

    def check_all(self):
        data = message_log.get_all()
        if len(data) < 2:
            print("[Recommender] Not enough topics to compare.")
            return

        candidate_pairs = []

        for t1 in data.keys():
            for t2 in data.keys():
                if t1 >= t2:
                    continue

                tags1 = data[t1]['tags']
                tags2 = data[t2]['tags']
                vals1 = [v for _, v in data[t1]['values']]
                vals2 = [v for _, v in data[t2]['values']]

                sem_score = self.compute_semantic_score(t1, t2, tags1, tags2)
                beh_score = self.compute_behaviour_score(vals1, vals2)

                print(f"[Recommender] RAW: {t1} ↔ {t2} | sem={sem_score:.3f} beh={beh_score:.3f}")

                if beh_score >= 0.9:
                    final_score = beh_score
                    reason = "High correlation override"
                elif sem_score >= self.id_thresh and beh_score >= self.corr_thresh:
                    final_score = 0.5 * sem_score + 0.5 * beh_score
                    reason = "Semantic + behavior"
                else:
                    # print(f"[Recommender] SKIP: {t1} ↔ {t2} did not pass basic threshold.")
                    continue

                self.scores.append(final_score)
                thresh = self.dynamic_threshold()
                print(f"[Recommender] FINAL: {final_score:.3f} vs dynamic_thresh={thresh:.3f} reason={reason}")

                if final_score >= thresh:
                    candidate_pairs.append((t1, t2))
                else:
                    print(f"[Recommender] SKIP: {t1} ↔ {t2} did not pass dynamic threshold.")

        print(f"[Recommender] Candidate pairs found: {len(candidate_pairs)}")

        if not candidate_pairs:
            print("[Recommender] No pairs passed; more data or looser thresholds needed.")
            return

        clusters = self.merge_clusters(candidate_pairs)

        cluster_count = 0
        for cluster in clusters:
            if len(cluster) < 2:
                continue
            score = round(sum(self.scores) / len(self.scores), 4)
            recommended_store.add(cluster, score, "Batch recommended cluster")
            # print(f"[Recommender] SAVED cluster: {cluster} with score {score}")
            cluster_count += 1
            if self.loop:
                asyncio.run_coroutine_threadsafe(
                    self._notify_ui(cluster, score, "Batch recommended cluster"),
                    self.loop
                )
            else:
                asyncio.run(self._notify_ui(cluster, score, "Batch recommended cluster"))

        if cluster_count == 0:
            print("[Recommender] Candidate pairs exist, but no clusters larger than 1 → not enough overlap yet. Keep feeding more data!")

    def set_loop(self, loop):
        self.loop = loop


# Singleton
recommendation_detector = RecommendationDetector()
