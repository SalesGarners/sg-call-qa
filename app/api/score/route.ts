import { NextRequest, NextResponse } from 'next/server';
import { scoreCall } from '@/lib/services/aiOrchestrator';
import { z } from 'zod';
import db from '@/lib/db';

const scoreSchema = z.object({
  transcript: z.string().min(10, "Transcript is too short"),
  provider: z.enum(['groq', 'gemini', 'openai', 'claude']),
  leadId: z.string().optional(),
  jobTitle: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = scoreSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: validation.error.format()
      }, { status: 400 });
    }

    const { transcript, provider, leadId, jobTitle } = validation.data;
    const result = await scoreCall(transcript, provider, jobTitle);

    // Save results to database if leadId is provided
    if (leadId) {
      try {
        await db.lead.update(leadId, {
          transcript,
          verdict: result.verdict,
          score: result.score,
          reasoning: result.reasoning,
          status: 'ANALYZED'
        });
      } catch (dbError) {
        console.error('Failed to update lead results:', dbError);
        // Still return the result even if DB update fails
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Scoring API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
