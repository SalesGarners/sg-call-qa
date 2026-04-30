import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import db from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.name) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch leads where addedBy matches the current user's name
    const agentLeads = await db.lead.findMany({ addedBy: session.user.name });

    return NextResponse.json(agentLeads);
  } catch (error: any) {
    console.error('Fetch Agent Leads Error:', error);
    return NextResponse.json({ error: 'Failed to fetch your leads' }, { status: 500 });
  }
}
