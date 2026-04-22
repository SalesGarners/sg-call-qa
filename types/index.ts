export type AIProvider = 'groq' | 'gemini' | 'openai' | 'claude';

export interface AnalysisResult {
  verdict: 'Good to Go (SQL)' | 'Borderline' | 'Not Qualified';
  score: number;
  intent: number;
  authority: number;
  demo_commitment: number;
  timeline: number;
  industry_fit: number;
  reasoning: string;
  risk_level: 'Low' | 'Medium' | 'High';
}

export interface ProcessingState {
  type: 'initializing' | 'transcribing' | 'scoring' | 'saving' | '';
  progress: number;
  error: string | null;
}
