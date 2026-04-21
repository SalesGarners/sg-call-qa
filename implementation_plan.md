# Full-Stack Architecture Pivot: Deepgram Intelligence + Node.js Backend

We are pivoting the architecture to build a secure Node.js backend. This allows us to protect all API keys and execute the complex pipeline (Deepgram Intelligence -> Unified Context -> Claude/AI) securely on the server.

Crucially, **we will preserve the existing B2B scoring schema** (Intent, Authority, Timeline, etc.). We will pass Deepgram's Intelligence data to the AI to *inform* its decisions on those B2B metrics, and append the new insights without deleting the structure that powers your beautiful Results UI.

## 1. Backend Implementation (Express.js)

We will introduce a lightweight Express backend proxy within the same repository. We'll set it to run alongside your Vite frontend.

### [NEW] `server/index.js`
- Create an Express app with `cors` and `dotenv`.
- Extract all API Keys from `import.meta.env` in the frontend and use Node.js `process.env`.
- **Endpoint:** `POST /api/analyze-call`.
- **Route Logic:**
  1. Receive `transcript` and `selectedProvider` from the frontend.
  2. **Deepgram Text Intelligence**: Send the transcript to Deepgram's `read.analyzeText` endpoint to extract `sentiment`, `topics`, `intents`, and `summarize`.
  3. **AI Scoring**: Inject the Deepgram Intelligence + Transcript into our existing `SYSTEM_PROMPT`.
  4. Call the requested LLM provider securely.
  5. Return the JSON to the frontend.

### Configuration Updates
- **`package.json`**: Add `express`, `cors`, `@deepgram/sdk`, `dotenv`, and `concurrently` to run both frontend and backend (`npm run dev:all`).
- **`vite.config.js`**: Update the proxy to forward `/api` to `http://localhost:3001` (our new Express server) instead of the AI providers directly.

## 2. Protected AI Schema Integration

We will **KEEP** the existing B2B schema (Intent, Authority, Timeline, fit, reasoning, verdict, risk).
We will **APPEND** Deepgram's direct insights into the final response payload sent from the backend to the frontend, so the frontend receives:

```javascript
{
  "scoring": { // The exact same B2B schema used today
    "verdict": "...",
    "score": 85,
    "intent": 25,
    // ...
  },
  "intelligence": { // Direct from Deepgram
    "sentiment": { "overall": "positive", "score": 0.8 },
    "summary": "...",
    "topics": ["pricing", "support"],
    "intents": ["request demo"]
  }
}
```
The System Prompt will be instructed to carefully consider the Deepgram Analytics context when evaluating the B2B metrics!

## 3. UI Remastering (Frontend)

We will preserve the current "QA Score" tab exactly as it is, maintaining the existing codebase and UX.

#### [MODIFY] `src/components/Step3_Results.jsx`
- Add a new Tab next to "QA Score" and "Transcript" called **Insights**.
- **Insights Tab View:**
  - Displays the Deepgram-generated `summary`.
  - Shows an overall `sentiment` badge.
  - Lists the `topics` and `intents` detected natively by Deepgram.

#### [MODIFY] `src/App.jsx`
- Replace the client-side `aiOrchestrator` call with a robust `axios.post('/api/analyze-call')` request.

## User Approval Required

> [!IMPORTANT]  
> Please approve this finalized plan:
> 1. We switch to a Node.js backend.
> 2. We keep your exact current B2B Schema.
> 3. We use Deepgram Intelligence as purely backend context to make the AI smarter, and natively display the Deepgram summary/sentiment in a new "Insights" tab.
