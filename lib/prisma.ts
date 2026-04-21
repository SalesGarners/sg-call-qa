/**
 * Database client — talks to the local Express server via HTTP.
 * On Vercel: requests go through the ngrok tunnel to your machine.
 * Locally: requests go directly to localhost:4000.
 *
 * Required env vars:
 *   LOCAL_DB_URL     — ngrok URL in production, http://localhost:4000 in dev
 *   LOCAL_DB_SECRET  — shared secret to authenticate with the local server
 */

const BASE_URL = process.env.LOCAL_DB_URL    || 'http://localhost:4000';
const SECRET   = process.env.LOCAL_DB_SECRET || 'change-me-in-production';

const headers = {
  'Content-Type':  'application/json',
  'x-api-secret':  SECRET,
};

async function request(method: string, path: string, body?: object) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    // Don't cache any DB calls
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Local DB ${method} ${path} → ${res.status}: ${text}`);
  }

  return res.json();
}

export const db = {
  lead: {
    async create(data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      category: string;
      employeeCount: string;
      jobTitle?: string;
    }) {
      return request('POST', '/leads', data);
    },

    async update(id: string, data: Partial<{
      transcript:     string;
      verdict:        string;
      score:          number;
      reasoning:      string;
      status:         string;
      emailStatus:    string;
      emailStatusRaw: string;
    }>) {
      return request('PATCH', `/leads/${id}`, data);
    },

    async findUnique(id: string) {
      try {
        return await request('GET', `/leads/${id}`);
      } catch {
        return null;
      }
    },

    async findMany() {
      return request('GET', '/leads');
    },
  },
};

export default db;
