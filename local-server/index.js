/**
 * SalesGarners Local Database Server
 * ─────────────────────────────────────────────────────────
 * Run this on your local machine + expose via ngrok.
 * The Vercel app sends lead data here; this server persists
 * everything to leads.db.json on your hard drive.
 *
 * Setup:
 *   cd local-server && npm install && node index.js
 *   ngrok http 4000
 *   Set LOCAL_DB_URL=https://xxxx.ngrok-free.app in Vercel env vars
 */

const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Secret key — Vercel sends this header so only YOUR Vercel app can write ──
const API_SECRET = process.env.LOCAL_DB_SECRET || 'change-me-in-production';

// ── DB file lives next to this script ──
const DB_PATH = path.join(__dirname, 'leads.db.json');

// ─── Helpers ────────────────────────────────────────────────────────────────

function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ leads: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function generateId() {
  return `lead_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({ origin: '*' }));          // Vercel can have many preview URLs
app.use(express.json({ limit: '2mb' }));

// Simple bearer-token auth — prevents random internet traffic from writing data
function authenticate(req, res, next) {
  const auth = req.headers['x-api-secret'] || req.headers['authorization'];
  const token = auth?.replace('Bearer ', '');
  if (token !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// Health check — Vercel can ping this to verify the server is up
app.get('/health', (req, res) => {
  const db = readDb();
  res.json({ status: 'ok', totalLeads: db.leads.length, timestamp: new Date().toISOString() });
});

// Create a new lead
app.post('/leads', authenticate, (req, res) => {
  try {
    const { firstName, lastName, email, phone, category, employeeCount, jobTitle } = req.body;
    if (!firstName || !email) {
      return res.status(400).json({ error: 'firstName and email are required' });
    }

    const db  = readDb();
    const now = new Date().toISOString();
    const lead = {
      id: generateId(),
      firstName, lastName, email, phone,
      category, employeeCount, jobTitle,
      transcript:      '',
      verdict:         null,
      score:           null,
      reasoning:       null,
      status:          'PENDING',
      emailStatus:     null,
      emailStatusRaw:  null,
      createdAt:       now,
      updatedAt:       now,
    };

    db.leads.push(lead);
    writeDb(db);
    console.log(`[CREATE] Lead ${lead.id} — ${firstName} ${lastName} <${email}>`);
    res.json(lead);
  } catch (err) {
    console.error('[CREATE] Error:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update a lead (score results, email status, push status)
app.patch('/leads/:id', authenticate, (req, res) => {
  try {
    const db  = readDb();
    const idx = db.leads.findIndex(l => l.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Lead not found' });

    db.leads[idx] = { ...db.leads[idx], ...req.body, updatedAt: new Date().toISOString() };
    writeDb(db);
    console.log(`[UPDATE] Lead ${req.params.id} — fields: ${Object.keys(req.body).join(', ')}`);
    res.json(db.leads[idx]);
  } catch (err) {
    console.error('[UPDATE] Error:', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Get a single lead (used by push-to-HubSpot route)
app.get('/leads/:id', authenticate, (req, res) => {
  const db   = readDb();
  const lead = db.leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
});

// List all leads
app.get('/leads', authenticate, (req, res) => {
  const db = readDb();
  const sorted = [...db.leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🟢  SalesGarners Local DB Server running on http://localhost:${PORT}`);
  console.log(`📁  Database: ${DB_PATH}`);
  console.log(`🔑  Secret:   ${API_SECRET === 'change-me-in-production' ? '⚠️  DEFAULT — set LOCAL_DB_SECRET env var!' : '✅ custom'}`);
  console.log(`\n   Next steps:`);
  console.log(`   1. Run: ngrok http ${PORT}`);
  console.log(`   2. Copy the https:// URL from ngrok`);
  console.log(`   3. Set in Vercel: LOCAL_DB_URL=<ngrok-url>  LOCAL_DB_SECRET=<your-secret>\n`);
});
