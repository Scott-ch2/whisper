"""
Inference Pipeline — orchestrates ASR → NMT flow

Strategy: "Transcribe first, then translate each segment"
For each ASR segment, immediately run NMT to minimize end-to-end latency.
"""
import logging
from typing import List, Dict, Any, Optional

from app.asr_engine import ASREngine
from app.nmt_engine import NMTEngine

logger = logging.getLogger(__name__)


class SpeechTranslationPipeline:
    """Full speech-to-translation pipeline."""

    def __init__(self):
        self.asr = ASREngine(model_name="turbo")
        self.nmt = NMTEngine()

    def transcribe(
        self,
        audio_bytes: bytes,
        language: str = "auto",
        model_name: str = "turbo",
    ) -> Dict[str, Any]:
        """ASR-only: audio → text + segments."""
        if self.asr.model_name != model_name:
            self.asr = ASREngine(model_name=model_name)

        result = self.asr.transcribe(audio_bytes, language=language)
        return result

    def run(
        self,
        audio_bytes: bytes,
        src_lang: str = "auto",
        tgt_lang: str = "zh",
    ) -> Dict[str, Any]:
        """
        Full pipeline: audio → ASR → NMT (per segment).

        Args:
            audio_bytes:  Raw audio file bytes
            src_lang:     Source language ("auto" for auto-detect)
            tgt_lang:     Target language code

        Returns:
            {
                "transcription": "Full original text",
                "translation": "Full translated text",
                "detected_language": "zh",
                "segments": [
                    {
                        "start": 0.0, "end": 2.5,
                        "sourceText": "...",
                        "targetText": "..."
                    }
                ],
                "duration": 4.8
            }
        """
        # Step 1: ASR
        logger.info(f"Starting ASR (lang={src_lang})")
        asr_result = self.asr.transcribe(audio_bytes, language=src_lang)
        detected = asr_result["language"]
        logger.info(f"ASR done. Detected: {detected}, segments: {len(asr_result['segments'])}")

        # Use detected language if src_lang was "auto"
        effective_src = src_lang if src_lang != "auto" else detected

        # Step 2: NMT per segment
        translated_segments: List[Dict[str, Any]] = []
        full_translation_parts: List[str] = []

        for seg in asr_result["segments"]:
            source_text = seg["text"]
            target_text = self.nmt.translate(source_text, effective_src, tgt_lang)

            translated_segments.append({
                "start": seg["start"],
                "end": seg["end"],
                "sourceText": source_text,
                "targetText": target_text or "[untranslated]",
            })

            if target_text:
                full_translation_parts.append(target_text)

        full_translation = " ".join(full_translation_parts) if full_translation_parts else ""

        logger.info(f"Pipeline complete. Translation length: {len(full_translation)} chars")

        return {
            "transcription": asr_result["text"],
            "translation": full_translation,
            "detectedLanguage": detected,
            "segments": translated_segments,
            "duration": asr_result["duration"],
        }


# ── Singleton ──────────────────────────────────────────────────────────
_pipeline_instance: SpeechTranslationPipeline | None = None

def get_pipeline() -> SpeechTranslationPipeline:
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = SpeechTranslationPipeline()
    return _pipeline_instance
