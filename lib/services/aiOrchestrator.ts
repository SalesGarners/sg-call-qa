import { scoreWithGroq, scoreWithGemini, scoreWithOpenAI, scoreWithClaude } from './aiProviders';
import { AIProvider, AnalysisResult } from '@/types';

export const PROVIDERS: Record<string, AIProvider> = {
  GROQ: 'groq',
  GEMINI: 'gemini',
  OPENAI: 'openai',
  CLAUDE: 'claude',
};

export const scoreCall = async (
  transcript: string,
  provider: AIProvider,
  jobTitle?: string,
  category?: string
): Promise<AnalysisResult> => {
  switch (provider) {
    case PROVIDERS.GROQ:
      return await scoreWithGroq(transcript, jobTitle, category);
    case PROVIDERS.GEMINI:
      return await scoreWithGemini(transcript, jobTitle, category);
    case PROVIDERS.OPENAI:
      return await scoreWithOpenAI(transcript, jobTitle, category);
    case PROVIDERS.CLAUDE:
      return await scoreWithClaude(transcript, jobTitle, category);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
};
