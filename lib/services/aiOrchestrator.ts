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
  jobTitle?: string
): Promise<AnalysisResult> => {
  switch (provider) {
    case PROVIDERS.GROQ:
      return await scoreWithGroq(transcript, jobTitle);
    case PROVIDERS.GEMINI:
      return await scoreWithGemini(transcript, jobTitle);
    case PROVIDERS.OPENAI:
      return await scoreWithOpenAI(transcript, jobTitle);
    case PROVIDERS.CLAUDE:
      return await scoreWithClaude(transcript, jobTitle);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
};
