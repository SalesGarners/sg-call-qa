import { NextResponse } from 'next/server';
import db from '@/lib/db';
import axios from 'axios';

// Reoon status field → human-readable label
function parseReoonStatus(data: any): string {
  const status: string = (data?.status ?? data?.data?.status ?? 'unknown').toLowerCase().trim();

  console.log('[Reoon] Raw response:', JSON.stringify(data));
  console.log('[Reoon] Parsed status field:', status);

  const labelMap: Record<string, string> = {
    valid: 'Valid',
    invalid: 'Invalid',
    safe_to_send: 'Safe to Send',
    risky: 'Risky',
    unknown: 'Unknown',
    disposable: 'Disposable',
    role_account: 'Role Account',
    spamtrap: 'Spam Trap',
    catch_all: 'Catch-All',
    do_not_mail: 'Do Not Mail',
  };

  return labelMap[status] ?? `Unknown (${status})`;
}

export const maxDuration = 60;

/**
 * GET /api/leads?q=searchTerm
 * Searches leads by email, name, or phone. Used by the analyzer for auto-fill and dashboard.
 * If no query is provided, returns all leads prioritized by PENDING status.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (query && query.trim().length >= 2) {
      const results = await db.lead.search(query.trim());
      return NextResponse.json(results);
    }

    // If no query, return all leads (prioritized by PENDING)
    const allLeads = await db.lead.findMany();
    // Sort logic in db.lead.findMany is by newest first, 
    // let's ensure PENDING are at the top here or in DB layer.
    // Actually, db.lead.findMany already sorts by createdAt.
    // Let's refine the sorting to PENDING first.
    const sortedLeads = [...allLeads].sort((a: any, b: any) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(sortedLeads);
  } catch (error: any) {
    console.error('Lead Search/Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

/**
 * POST /api/leads
 * Creates a fully analyzed lead (used when no existing lead was selected).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      firstName, lastName, email, phone, category, employeeCount, jobTitle, 
      transcript, verdict, score, reasoning, status,
      intent, authority, demo_commitment, timeline, industry_fit, risk_level
    } = body;

    // 1. Create lead in DB
    const lead = await db.lead.create({ 
      firstName, lastName, email, phone, category, employeeCount, jobTitle, 
      transcript, verdict, score, reasoning, 
      intent, authority, demo_commitment, timeline, industry_fit, risk_level,
      status: status || 'ANALYZED' 
    }) as any;

    // 2. Verify email via Reoon — quick mode (~0.5s, no SMTP)
    const apiKey = process.env.REOON_API_KEY;
    console.log('[Reoon] API key present:', !!apiKey, '| Email:', email);

    if (apiKey) {
      try {
        const url = `https://emailverifier.reoon.com/api/v1/verify`;
        const params = { email, mode: 'quick', key: apiKey };
        console.log('[Reoon] Calling:', url, params);

        const verifyRes = await axios.get(url, { params, timeout: 5000 });
        console.log('[Reoon] HTTP status:', verifyRes.status);

        const label = parseReoonStatus(verifyRes.data);
        console.log('[Reoon] Final label:', label);

        await db.lead.update(lead.id, { emailStatus: label, emailStatusRaw: JSON.stringify(verifyRes.data) });
        lead.emailStatus = label;
      } catch (verifyErr: any) {
        console.error('[Reoon] Verification error:', verifyErr?.message ?? verifyErr);
        lead.emailStatus = null;
      }
    } else {
      console.warn('[Reoon] REOON_API_KEY not found in environment');
    }

    console.log('[Leads] Returning lead with emailStatus:', lead.emailStatus);
    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('Create Lead Error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
