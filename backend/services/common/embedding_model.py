## services/common/embedding_model.py
from sentence_transformers import SentenceTransformer

# Singleton embedding model for reuse across detectors
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')