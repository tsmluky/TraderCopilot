export type LiteSignal = {
  ts: string;
  token: string;
  timeframe: string;
  price: number | null;
  action: string;
  confidence: number | null;
  risk: string | null;
  tp: number | null;
  sl: number | null;
  note: string;
};

export type AnalyzeLiteResponse = {
  status: 'ok';
  signal: LiteSignal;
};

export type AnalyzeProResponse = {
  status: 'ok';
  token: string;
  timeframe: string;
  price: number | null;
  analysis_md: string;
};
