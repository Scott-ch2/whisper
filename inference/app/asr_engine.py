"""
ASR Engine — OpenAI Whisper wrapper

Supports: tiny, base, small, medium, turbo models
Outputs: full text, language detection, timed segments
"""
import logging
import tempfile
import os
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Lazy import — whisper is heavy
_whisper = None

def _get_whisper():
    global _whisper
    if _whisper is None:
        import whisper
        _whisper = whisper
    return _whisper


class ASREngine:
    """
    Whisper ASR engine with model caching.
    On first use, downloads the model (~1.5GB for turbo).
    """

    # Model size → approximate RAM usage
    MODEL_SIZES = {
        "tiny":   "~1 GB",
        "base":   "~1 GB",
        "small":  "~2 GB",
        "turbo":  "~6 GB (recommended)",
    }

    def __init__(self, model_name: str = "turbo"):
        self.model_name = model_name
        self._model = None

    @property
    def model(self):
        if self._model is None:
            whisper = _get_whisper()
            logger.info(f"Loading Whisper model: {self.model_name}")
            self._model = whisper.load_model(self.model_name)
            logger.info(f"Whisper {self.model_name} loaded.")
        return self._model

    def transcribe(
        self,
        audio_bytes: bytes,
        language: str = "auto",
    ) -> Dict[str, Any]:
        """
        Transcribe audio bytes to text with segments.

        Args:
            audio_bytes: Raw audio file bytes (WAV/MP3/FLAC/etc.)
            language: Language code or "auto" for auto-detection

        Returns:
            {
                "text": "full transcription",
                "language": "zh",
                "segments": [{"start": 0.0, "end": 2.5, "text": "..."}, ...],
                "duration": 4.8
            }
        """
        # Save bytes to temp file (Whisper needs a file path)
        suffix = ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            transcribe_opts = {}
            if language and language != "auto":
                transcribe_opts["language"] = language

            result = self.model.transcribe(tmp_path, **transcribe_opts)

            segments = []
            for seg in result.get("segments", []):
                segments.append({
                    "start": round(seg["start"], 2),
                    "end": round(seg["end"], 2),
                    "text": seg["text"].strip(),
                })

            return {
                "text": result["text"].strip(),
                "language": result.get("language", "unknown"),
                "segments": segments,
                "duration": round(result.get("duration", 0), 1),
            }

        finally:
            # Clean up temp file
            try:
                os.unlink(tmp_path)
            except OSError:
                pass


# ── Singleton ──────────────────────────────────────────────────────────
_asr_instance: ASREngine | None = None

def get_asr_engine(model_name: str = "turbo") -> ASREngine:
    global _asr_instance
    if _asr_instance is None:
        _asr_instance = ASREngine(model_name=model_name)
    return _asr_instance
