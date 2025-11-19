from __future__ import annotations

import os
import time
from typing import Literal, List, Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .utils import log_row, stream_csv, ensure_log_dirs
from .notify import send_telegram
from .market_data import snapshot
from . import format_prompt_pro as pro
from . import format_prompt_lite as lite
from .deepseek_client import generate_pro


# =========================
#   Pydantic Models (v0.7)
# =========================

class LiteReq(BaseModel):
    token: str
    timeframe: str


class ProReq(BaseModel):
    token: str
    timeframe: str
    user_message: str = ""
    context: Dict[str, Any] | None = None


class AdvisorReq(BaseModel):
    token: str
    direction: Literal["long", "short"]
    entry: float
    tp: float
    sl: float
    size_quote: float


class LiteSignal(BaseModel):
    timestamp: str
    token: str
    timeframe: str
    direction: Literal["long", "short"]
    entry: float
    tp: float
    sl: float
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str
    source: str = "lite-rule@v1"


class AdvisorResp(BaseModel):
    token: str
    direction: Literal["long", "short"]
    entry: float
    tp: float
    sl: float
    size_quote: float
    alternatives: List[Dict[str, Any]]
    risk_score: float
    confidence: float


# ===============
#   FastAPI app
# ===============

app = FastAPI(title="TraderCopilot Backend", version="0.7.0-mvp")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, Any]:
    """
    Simple healthcheck + ensure de estructura de logs.
    """
    ensure_log_dirs()
    return {"ok": True, "version": "0.7.0-mvp"}


# --------------------
#   Analyze: LITE
# --------------------
@app.post("/analyze/lite")
def analyze_lite(req: LiteReq):
    """
    Señal LITE baseline (placeholder):
    - genera una señal LONG neutral con niveles dummy
    - loggea en backend/logs/LITE/{token}.csv
    """
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    sig = LiteSignal(
        timestamp=ts,
        token=req.token.upper(),
        timeframe=req.timeframe,
        direction="long",
        entry=100.0,
        tp=101.2,
        sl=98.5,
        confidence=0.62,
        rationale="Pullback EMA21 con RSI>50 y volumen creciente",
        source="lite-rule@v1",
    )

    # Log CSV por modo/token
    log_row("LITE", req.token, sig.model_dump(mode="json"))

    # Devolvemos dict JSON-friendly
    return sig.model_dump(mode="json")


# --------------------
#   Analyze: PRO
# --------------------
@app.post("/analyze/pro")
def analyze_pro(req: ProReq):
    """
    Modo PRO:
    - snapshot de mercado
    - lectura de brain/{token}/...
    - construcción de prompt con formato estricto
    - llamada a generate_pro(prompt) que usa DeepSeek/LLM
    - devuelve bloque Markdown entre #ANALYSIS_START..END
    """
    mkt = snapshot(req.token)
    brain_ctx = _read_brain(req.token)

    prompt = pro.build_prompt(
        token=req.token,
        timeframe=req.timeframe,
        user_message=req.user_message,
        market=mkt,
        brain_context=brain_ctx,
    )

    result_md = generate_pro(prompt)

    row = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "token": req.token.upper(),
        "timeframe": req.timeframe,
        "block_len": len(result_md),
        "source": "pro@strict-v1",
    }
    log_row("PRO", req.token, row)

    return PlainTextResponse(result_md, media_type="text/markdown")


# --------------------
#   Analyze: ADVISOR
# --------------------
@app.post("/analyze/advisor")
def analyze_advisor(req: AdvisorReq):
    """
    Asesor de posición abierta (baseline):
    - devuelve alternativas simples con riesgo/confianza
    - loggea en backend/logs/ADVISOR/{token}.csv
    """
    resp = AdvisorResp(
        token=req.token.upper(),
        direction=req.direction,
        entry=req.entry,
        size_quote=req.size_quote,
        tp=req.tp,
        sl=req.sl,
        alternatives=[
            {"if": "breaks key level", "action": "trail sl", "rr_target": 1.6},
            {"if": "invalidates setup", "action": "cut 50%", "rr_target": 1.1},
        ],
        risk_score=0.44,
        confidence=0.63,
    )

    log_row("ADVISOR", req.token, resp.model_dump(mode="json"))
    return resp.model_dump(mode="json")


# --------------------
#   Logs streaming
# --------------------
@app.get("/logs/{mode}/{token}")
def get_logs(mode: str, token: str):
    """
    Devuelve el CSV de logs por modo/token:
    - mode ∈ {LITE, PRO, ADVISOR, EVALUATED}
    - token ∈ {eth, btc, sol, xau}
    """
    if mode.upper() not in {"LITE", "PRO", "ADVISOR", "EVALUATED"}:
        raise HTTPException(status_code=400, detail="mode inválido")

    content = stream_csv(mode, token)
    return PlainTextResponse(content, media_type="text/csv")


# --------------------
#   Telegram notify
# --------------------
@app.post("/notify/telegram")
def notify(body: Dict[str, Any]):
    """
    Envía un mensaje simple al canal/usuario configurado.
    Body: { "text": "..." }
    """
    text = str(body.get("text", "")).strip()
    if not text:
        raise HTTPException(status_code=400, detail="text requerido")

    res = send_telegram(text)
    return res


# --------------------
#   Brain loader
# --------------------
def _read_brain(token: str) -> str:
    """
    Lee brain/{token}/{insights.md,news.txt,onchain.txt,sentiment.txt}
    y concatena el contenido como contexto para el prompt PRO.
    """
    base = os.path.join("backend", "brain", token.lower())
    chunks: List[str] = []

    for name in ["insights.md", "news.txt", "onchain.txt", "sentiment.txt"]:
        p = os.path.join(base, name)
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    txt = f.read().strip()
                    if txt:
                        chunks.append(txt)
            except Exception:
                # En MVP ignoramos errores de lectura individuales
                continue

    return "\n\n".join(chunks).strip()
