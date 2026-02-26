/**
 * Types alignés sur prompteur_schemas.py (backend FastAPI)
 */

export type TranslateDirection = "fr_to_en" | "en_to_fr";

export interface SlideContext {
  id: number;
  title: string;
  script: string;
  notes?: string | null;
  kpis: string[];
}

export interface LoggedQuestion {
  question: string;
  answer: string;
  slide_title: string;
}

export interface SuggestAnswerRequest {
  question: string;
  slide: SlideContext;
  lang?: string;
}

export interface TranslateRequest {
  text: string;
  direction: TranslateDirection;
}

export interface SummarizeRequest {
  presentation_title: string;
  slides: SlideContext[];
  questions_logged?: LoggedQuestion[];
}

export interface ImportPptxResponse {
  title: string;
  slide_count: number;
  slides: SlideContext[];
}

export interface HealthResponse {
  status: string;
  module: string;
  anthropic_key_set: boolean;
}
