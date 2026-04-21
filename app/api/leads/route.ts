import { NextResponse } from 'next/server';
import db from '@/lib/prisma';
import axios from 'axios';

// Reoon status field → human-readable label
// Reoon can return status in `status` or `data.status` depending on mode
function parseReoonStatus(data: any): string {
  // Reoon quick mode response structure
  const status: string = (data?.status ?? data?.data?.status ?? 'unknown').toLowerCase().trim();

  console.log('[Reoon] Raw response:', JSON.stringify(data));
  console.log('[Reoon] Parsed status field:', status);

  const labelMap: Record<string, string> = {
    valid:          'Valid',
    invalid:        'Invalid',
    safe_to_send:   'Safe to Send',
    risky:          'Risky',
    unknown:        'Unknown',
    disposable:     'Disposable',
    role_account:   'Role Account',
    spamtrap:       'Spam Trap',
    catch_all:      'Catch-All',
    do_not_mail:    'Do Not Mail',
  };

  return labelMap[status] ?? `Unknown (${status})`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, category, employeeCount, jobTitle } = body;

    // 1. Create lead in DB (await required as lib/prisma uses fetch)
    const lead = await db.lead.create({ firstName, lastName, email, phone, category, employeeCount, jobTitle }) as any;

    // 2. Verify email via Reoon — quick mode (~0.5s, no SMTP)
    const apiKey = process.env.REOON_API_KEY;
    console.log('[Reoon] API key present:', !!apiKey, '| Email:', email);

    if (apiKey) {
      try {
        const url = `https://emailverifier.reoon.com/api/v1/verify`;
        const params = { email, mode: 'quick', key: apiKey };
        console.log('[Reoon] Calling:', url, params);

        const verifyRes = await axios.get(url, { params, timeout: 15000 });
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
