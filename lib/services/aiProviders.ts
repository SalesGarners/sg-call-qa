import axios from 'axios';
import { getPromptForCategory } from './prompts';
import { AnalysisResult } from '@/types';

// Helper to clean JSON from AI responses (strips markdown code fences)
const cleanAIResponse = (text: string): string => {
  return text.replace(/```json|```/g, '').trim();
};

// Builds the user message, injecting job title + category context if available
const buildUserMessage = (transcript: string, jobTitle?: string, category?: string): string => {
  const jobContext = jobTitle
    ? `\nLead's Job Title: ${jobTitle}\nUse this job title to inform the Authority score — higher titles (e.g. Partner, Director, CHRO, HR Manager, etc.) should score higher on authority.\n`
    : '';
  const categoryContext = category
    ? `\nCampaign Category: ${category}\n`
    : '';
  return `${categoryContext}${jobContext}\nAnalyze this call transcript:\n\n${transcript}`;
};

export const scoreWithGroq = async (transcript: string, jobTitle?: string, category?: string): Promise<AnalysisResult> => {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new Error('Groq API Key missing');

  const systemPrompt = getPromptForCategory(category);

  const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildUserMessage(transcript, jobTitle, category) }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  }, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  });

  return JSON.parse(response.data.choices[0].message.content);
};

export const scoreWithGemini = async (transcript: string, jobTitle?: string, category?: string): Promise<AnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('Gemini API Key missing');

  const systemPrompt = getPromptForCategory(category);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  const response = await axios.post(url, {
    contents: [{ parts: [{ text: `${systemPrompt}\n\n${buildUserMessage(transcript, jobTitle, category)}` }] }],
    generationConfig: { temperature: 0.1 }
  });

  const content = response.data.candidates[0].content.parts[0].text;
  return JSON.parse(cleanAIResponse(content));
};

export const scoreWithOpenAI = async (transcript: string, jobTitle?: string, category?: string): Promise<AnalysisResult> => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('OpenAI API Key missing');

  const systemPrompt = getPromptForCategory(category);

  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-5.4-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildUserMessage(transcript, jobTitle, category) }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  }, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  });

  return JSON.parse(response.data.choices[0].message.content);
};

export const scoreWithClaude = async (transcript: string, jobTitle?: string, category?: string): Promise<AnalysisResult> => {
  const apiKey = process.env.CLAUDE_API_KEY?.trim();
  if (!apiKey) throw new Error('Claude API Key missing');

  const systemPrompt = getPromptForCategory(category);

  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: buildUserMessage(transcript, jobTitle, category) }],
    temperature: 0.1
  }, {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }
  });

  const content = response.data.content[0].text;
  return JSON.parse(cleanAIResponse(content));
};
