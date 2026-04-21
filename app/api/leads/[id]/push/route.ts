import { NextResponse } from 'next/server';
import db from '@/lib/prisma';
import axios from 'axios';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const lead = await db.lead.findUnique(id) as any;

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Format data for HubSpot
    const hData = new FormData();
    hData.append('0-1/firstname', lead.firstName);
    hData.append('0-1/lastname', lead.lastName);
    hData.append('0-1/email', lead.email);
    hData.append('0-1/phone', lead.phone);
    hData.append('0-1/email_notes', lead.reasoning || '');
    hData.append('0-1/contact_employee_count', lead.employeeCount);
    hData.append('0-1/category', lead.category);
    hData.append('0-1/qa_score', lead.verdict || '');
    hData.append('0-1/score_attained', lead.score?.toString() || '');
    hData.append('0-1/lead_source', 'Channel Partner');
    hData.append('0-1/converting_asset', 'SalesGarner');

    const hsContext = {
      pageUri: 'https://salesgarners.com/call-qa',
      pageName: 'AI Call Quality Analyzer',
      source: 'forms-embed-static'
    };
    hData.append('hs_context', JSON.stringify(hsContext));

    await axios.post(
      'https://forms.hsforms.com/submissions/v3/public/submit/formsnext/multipart/6107502/0bf35c2a-3bb0-4aaf-9acb-9e72c9f1b105',
      hData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    // Mark as pushed in local DB
    await db.lead.update(id, { status: 'PUSHED_TO_CRM' });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('HubSpot Push Error:', error);
    return NextResponse.json({ 
      error: error.response?.data?.message || 'Failed to push to CRM' 
    }, { status: 500 });
  }
}
