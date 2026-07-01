"""
NMT Engine — HuggingFace OPUS-MT wrapper

Language pairs supported (Helsinki-NLP models):
  zh→en, en→zh, ja→zh, ko→zh

Model size: ~300MB per language pair
"""
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# Lazy imports — transformers is heavy
_imports_done = False
_AutoTokenizer = None
_AutoModelForSeq2SeqLM = None

def _ensure_imports():
    global _imports_done, _AutoTokenizer, _AutoModelForSeq2SeqLM
    if not _imports_done:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        _AutoTokenizer = AutoTokenizer
        _AutoModelForSeq2SeqLM = AutoModelForSeq2SeqLM
        _imports_done = True


# ── Language pair → HuggingFace model name ─────────────────────────────
MODEL_MAP: Dict[str, str] = {
    "zh-en": "Helsinki-NLP/opus-mt-zh-en",
    "en-zh": "Helsinki-NLP/opus-mt-en-zh",
    "ja-zh": "Helsinki-NLP/opus-mt-ja-zh",
    "ko-zh": "Helsinki-NLP/opus-mt-ko-zh",
}


class NMTEngine:
    """
    OPUS-MT neural machine translation engine.
    Caches loaded models to avoid reloading.
    """

    def __init__(self):
        _ensure_imports()
        self._model_cache: Dict[str, tuple] = {}

    def _get_or_load_model(self, model_name: str):
        """Load model + tokenizer from HuggingFace, cache in memory."""
        if model_name not in self._model_cache:
            logger.info(f"Downloading/Caching model: {model_name}")
            tokenizer = _AutoTokenizer.from_pretrained(model_name)
            model = _AutoModelForSeq2SeqLM.from_pretrained(model_name)
            self._model_cache[model_name] = (tokenizer, model)
            logger.info(f"Model loaded: {model_name}")
        return self._model_cache[model_name]

    def translate(
        self,
        text: str,
        src_lang: str,
        tgt_lang: str,
    ) -> Optional[str]:
        """
        Translate text between supported language pairs.

        Args:
            text: Source text
            src_lang: Source language code (zh/en/ja/ko)
            tgt_lang: Target language code (zh/en)

        Returns:
            Translated text, or None if language pair not supported
        """
        pair_key = f"{src_lang}-{tgt_lang}"
        model_name = MODEL_MAP.get(pair_key)

        if not model_name:
            logger.warning(f"Unsupported language pair: {pair_key}")
            return None

        try:
            tokenizer, model = self._get_or_load_model(model_name)
            inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
            outputs = model.generate(**inputs, max_length=512)
            result = tokenizer.decode(outputs[0], skip_special_tokens=True)
            return result
        except Exception as e:
            logger.error(f"Translation failed for {pair_key}: {e}")
            return None


# ── Singleton ──────────────────────────────────────────────────────────
_nmt_instance: NMTEngine | None = None

def get_nmt_engine() -> NMTEngine:
    global _nmt_instance
    if _nmt_instance is None:
        _nmt_instance = NMTEngine()
    return _nmt_instance
