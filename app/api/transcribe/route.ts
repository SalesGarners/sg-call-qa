import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/services/deepgram';

export const maxDuration = 60; // Allow long-running transcription tasks

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const transcript = await transcribeAudio(buffer, audioFile.type);

    return NextResponse.json({ transcript });
  } catch (error: any) {
    console.error('Transcription API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
