import { api } from "../../lib/client";
import type { LiteSignal } from "./types";

// Forma en que responde el backend v0.7 en /analyze/lite
type LiteSignalBackend = {
  timestamp: string;
  token: string;
  timeframe: string;
  direction: string;
  entry: number;
  tp: number;
  sl: number;
  confidence: number;
  rationale: string;
  source: string;
};

// Analiza en modo LITE contra /analyze/lite
export async function analyzeLite(params: {
  token: string;
  timeframe: string;
  message?: string;
}) {
  const { data } = await api.post<LiteSignalBackend>("/analyze/lite", {
    token: params.token,
    timeframe: params.timeframe,
  });

  if (!data || typeof data !== "object") {
    throw new Error("Respuesta LITE inválida");
  }

  const backend = data as LiteSignalBackend;

  const sig: LiteSignal = {
    ts: backend.timestamp,
    token: backend.token,
    timeframe: backend.timeframe,
    price: typeof backend.entry === "number" ? backend.entry : null,
    action: backend.direction?.toUpperCase?.() || "",
    confidence:
      typeof backend.confidence === "number" ? backend.confidence : null,
    risk: null,
    tp: typeof backend.tp === "number" ? backend.tp : null,
    sl: typeof backend.sl === "number" ? backend.sl : null,
    note: backend.rationale || "",
  };

  return sig;
}

// Resultado que espera el frontend para PRO
type AnalyzeProResult = {
  token: string;
  timeframe: string;
  price: number | null;
  analysis_md: string;
};

// Analiza en modo PRO contra /analyze/pro (texto plano markdown)
export async function analyzePro(params: {
  token: string;
  timeframe: string;
  message: string;
}) {
  const { data } = await api.post<string>(
    "/analyze/pro",
    {
      token: params.token,
      timeframe: params.timeframe,
      user_message: params.message,
    },
    {
      responseType: "text",
    }
  );

  const md = typeof data === "string" ? data : "";
  if (md.trim().length < 8) {
    throw new Error("analysis_md vacío");
  }

  const result: AnalyzeProResult = {
    token: params.token,
    timeframe: params.timeframe,
    price: null, // de momento no lo usamos en el frontend
    analysis_md: md,
  };

  return result;
}

// ---- Utilidades simples para parsear CSV de /logs/{mode}/{token} ----

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // Manejar comillas escapadas ("")
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current);
  return result.map((s) => s.trim());
}

function parseCsv(text: string): any[] {
  const trimmed = (text || "").trim();
  if (!trimmed) return [];

  const lines = trimmed.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = splitCsvLine(line);
    const obj: any = {};

    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? "";
    });

    // Normalización mínima para que History.tsx tenga algo que mostrar
    obj.ts = obj.timestamp || obj.signal_ts || "";
    obj.action = obj.direction || obj.result || obj.source || obj.token || "";

    rows.push(obj);
  }

  return rows;
}

// Logs CSV: /logs/{mode}/{token}
export async function getLogs(params: {
  token: string;
  mode: "LITE" | "PRO";
  limit?: number;
  offset?: number;
}) {
  const modeSegment = params.mode.toUpperCase();
  const path = `/logs/${modeSegment}/${params.token.toLowerCase()}`;

  const { data } = await api.get<string>(path, {
    responseType: "text",
  });

  const csvText = typeof data === "string" ? data : "";
  return parseCsv(csvText);
}
