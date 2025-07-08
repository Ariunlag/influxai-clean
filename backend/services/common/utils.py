import re
from scipy.stats import pearsonr


def normalize_topic(topic: str) -> str:
    """
    Normalize an MQTT topic string: lowercase, strip slashes, replace spaces/hyphens with underscores.
    """
    t = topic.lower().strip('/')
    t = re.sub(r"[\s\-]+", "_", t)
    while '__' in t:
        t = t.replace('__', '_')
    return t


def value_correlation(vals1: list, vals2: list) -> float:
    """
    Compute absolute Pearson correlation between two equal-length series with at least 5 points.
    """
    if len(vals1) < 5 or len(vals2) < 5 or len(vals1) != len(vals2):
        return 0.0
    r, _ = pearsonr(vals1, vals2)
    return abs(r)


## services/common/embedding_model.py
from sentence_transformers import SentenceTransformer

# Singleton embedding model for reuse across detectors
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

