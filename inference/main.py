"""
Whisper Inference Service — FastAPI application

Audio → ASR (Whisper) → NMT (OPUS-MT) → JSON response

Endpoints:
  POST /inference/transcribe    — ASR only
  POST /inference/translate     — ASR + NMT pipeline
  GET  /inference/health        — Health check
"""
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.pipeline import SpeechTranslationPipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Whisper Inference Service",
    description="Speech Recognition + Machine Translation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Lazy-init pipeline (models load into memory on first request) ──────
pipeline: SpeechTranslationPipeline | None = None

def get_pipeline() -> SpeechTranslationPipeline:
    global pipeline
    if pipeline is None:
        logger.info("Loading Whisper + NMT models (this may take a minute)...")
        pipeline = SpeechTranslationPipeline()
        logger.info("Models loaded successfully.")
    return pipeline


@app.get("/inference/health")
async def health():
    return {"status": "healthy", "service": "whisper-inference"}


@app.post("/inference/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form(default="auto"),
    model: str = Form(default="turbo"),
):
    """ASR: audio file → transcription with timestamps"""
    if not file.filename:
        raise HTTPException(400, "No file provided")

    audio_bytes = await file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(400, "Empty file")

    p = get_pipeline()
    result = p.transcribe(audio_bytes, language=language, model_name=model)
    return {"code": 200, "data": result}


@app.post("/inference/translate")
async def translate(
    file: UploadFile = File(...),
    src_lang: str = Form(default="auto"),
    tgt_lang: str = Form(default="zh"),
):
    """Full pipeline: audio → ASR → NMT → segments"""
    if not file.filename:
        raise HTTPException(400, "No file provided")

    audio_bytes = await file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(400, "Empty file")

    p = get_pipeline()
    result = p.run(audio_bytes, src_lang=src_lang, tgt_lang=tgt_lang)
    return {"code": 200, "data": result}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
