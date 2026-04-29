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
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const parseDateParam = (param: string | null) => {
      if (!param || param === 'undefined' || param === 'null' || param.trim() === '') return null;
      return param;
    };

    const start = parseDateParam(startDateParam);
    const end = parseDateParam(endDateParam);
    
    const filter: any = {};
    if (start || end) {
      filter.createdAt = {};
      if (start) {
        filter.createdAt.$gte = new Date(`${start}T00:00:00.000`);
      }
      if (end) {
        filter.createdAt.$lte = new Date(`${end}T23:59:59.999`);
      }
    }

    if (query && query.trim().length >= 2) {
      const results = await db.lead.search(query.trim(), filter);
      return NextResponse.json(results);
    }

    // If no query, return all leads (prioritized by PENDING)
    const allLeads = await db.lead.findMany(filter);
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
      transcript, verdict: rawVerdict, score, reasoning, status, aiProvider, addedBy,
      intent, authority, demo_commitment, timeline, industry_fit, risk_level
    } = body;

    // Normalize verdict to exact DB enum values
    const normalizeVerdict = (v: string | null | undefined): string | undefined => {
      if (!v) return undefined;
      const lower = v.toLowerCase().trim();
      if (lower.includes('good to go') || lower.includes('sql')) return 'Good to Go (SQL)';
      if (lower.includes('borderline')) return 'Borderline';
      if (lower.includes('not qualified') || lower.includes('disqualified')) return 'Not Qualified';
      return v; // fallback to raw value
    };

    const verdict = normalizeVerdict(rawVerdict);

    // Ensure score matches sum of sub-metrics
    const calculatedScore = (Number(intent) || 0) + (Number(authority) || 0) + (Number(demo_commitment) || 0) + (Number(industry_fit) || 0);
    const finalScore = calculatedScore > 0 ? calculatedScore : (Number(score) || 0);

    // Normalize AI provider
    const finalAiProvider = aiProvider || 'groq';

    // 1. Create lead in DB
    const lead = await db.lead.create({ 
      firstName, lastName, email, phone, category, employeeCount, jobTitle, 
      transcript, verdict, score: finalScore, reasoning, 
      intent, authority, demo_commitment, timeline, industry_fit, risk_level,
      status: status || 'ANALYZED',
      aiProvider: finalAiProvider,
      addedBy
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
