import { NextResponse } from 'next/server';
import db from '@/lib/db';
import axios from 'axios';

function parseReoonStatus(data: any): string {
  const status: string = (data?.status ?? data?.data?.status ?? 'unknown').toLowerCase().trim();
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
 * POST /api/leads/intake
 * Called by the Agent Lead Form. Creates a lead with status PENDING.
 * Runs Reoon email verification.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, category, employeeCount, jobTitle, addedBy } = body;

    if (!firstName || !lastName || !email || !phone || !category || !employeeCount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Record time in EST
    const createdAtEST = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Create lead with PENDING status (no analysis data yet)
    const lead = await db.lead.create({
      firstName, lastName, email, phone, category, employeeCount, jobTitle,
      addedBy,
      status: 'PENDING',
      createdAtEST
    }) as any;

    // Verify email via Reoon
    const apiKey = process.env.REOON_API_KEY;
    if (apiKey) {
      try {
        const url = `https://emailverifier.reoon.com/api/v1/verify`;
        const params = { email, mode: 'quick', key: apiKey };
        const verifyRes = await axios.get(url, { params, timeout: 5000 });
        const label = parseReoonStatus(verifyRes.data);
        await db.lead.update(lead.id, { emailStatus: label, emailStatusRaw: JSON.stringify(verifyRes.data) });
        lead.emailStatus = label;
      } catch (verifyErr: any) {
        console.error('[Reoon] Verification error:', verifyErr?.message ?? verifyErr);
        lead.emailStatus = null;
      }
    }

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('Agent Intake Error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
