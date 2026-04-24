# AI Call Quality Analyzer - Technical Documentation

## Project Overview
The AI Call Quality Analyzer is a sophisticated full-stack application designed to automate the evaluation of sales calls. It transcribes audio recordings, analyzes the content using multiple Large Language Models (LLMs), and scores leads based on industry-standard criteria (Authority, Need, Budget, Timing). 

The goal is to provide immediate, actionable feedback on call quality and lead viability, eliminating manual review bottlenecks.

---

## 🛠 Tech Stack
*   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Authentication**: [Next-Auth](https://next-auth.js.org/) (Credentials Provider)
*   **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/)
*   **Transcription**: [Deepgram SDK](https://deepgram.com/)
*   **AI Models**: Groq (Llama 3), Google Gemini, OpenAI (GPT-4), and Anthropic Claude.
*   **Styling**: Vanilla CSS with a focus on premium, modern aesthetics.
*   **State Management**: React Hooks (useState, useEffect, useSession).

---

## 🏗 System Design
The application follows a **Serverless-First** architecture using Next.js. 

### Core Architecture:
1.  **Client Layer**: A responsive React-based UI that handles lead data entry, audio recording/uploading, and real-time process visualization.
2.  **API Layer (Backend)**: Next.js API Routes handle sensitive operations like communicating with AI providers and the database.
3.  **Persistence Layer**: MongoDB Atlas stores Lead records, transcripts, AI analysis results, and User credentials.
4.  **External Services**:
    *   **Deepgram**: High-accuracy, low-latency audio transcription.
    *   **AI Providers**: Orchestrated scoring based on dynamic category-specific prompts.
    *   **Reoon**: Integrated email verification to ensure lead data quality.

---

## 🔄 Data Flow
The "Lead Analysis" lifecycle follows an atomic, sequential path:

1.  **Collection**: The user enters lead details (Name, Email, Category) and uploads a call recording.
2.  **Transcription**: The audio buffer is sent to the `/api/transcribe` endpoint, which proxies it to Deepgram.
3.  **Scoring**: The resulting transcript is passed to the `/api/score` endpoint. The system selects the appropriate prompt from `lib/services/prompts.ts` based on the campaign category (e.g., HR, Legal, Marketing).
4.  **Verification**: Simultaneously, the lead's email is verified via the Reoon API.
5.  **Persistence (Atomic Save)**: Only after both transcription and scoring succeed is the record created in MongoDB. This prevents "orphaned" or incomplete records in the database.
6.  **Visualization**: The results are returned to the frontend and displayed in a premium "Results" view with specific scores and AI reasoning.

---

## 🔐 Authentication Flow
The application is secured using **Next-Auth** with a custom **Credentials Provider**.

1.  **Middle-Layer Protection**: A `proxy.ts` (Next.js 16 Middleware) intercepts all incoming requests. It redirects unauthenticated users to `/login` unless the request is for a static asset or an auth endpoint.
2.  **User Management**: Users are stored in a dedicated `Users` collection in MongoDB. Passwords are encrypted using `bcryptjs`.
3.  **Login Process**: 
    *   The user provides a `username` and `password`.
    *   The system verifies the hash in MongoDB.
    *   On success, a JWT-based session is created and persisted in a secure cookie.
4.  **Session Context**: The `<NextAuthProvider>` wraps the root layout, making user session data available to all components (e.g., for the "Hello, [User]" greeting and Logout button).

---

## 📦 Key Components & Features

### 1. **Step-Based Workflow**
*   **Step1_Upload**: Collects lead metadata and validates audio file selection.
*   **Step2_Processing**: Provides real-time status updates (Transcribing -> Scoring -> Saving) with an "Abort" mechanism to cancel mid-process.
*   **Step3_Results**: Displays high-impact visuals including the "Verdict" (Good to Go, Borderline, etc.), numerical scores, and detailed AI feedback.

### 2. **AI Orchestrator**
Located in `lib/services/aiOrchestrator.ts`, this service allows for seamless switching between AI providers (Groq, Gemini, etc.) and ensures that the correct system prompt is injected for the specific business context.

### 3. **Lead Management**
*   **Dashboard**: (If implemented) A central view to see all historical analyzed leads.
*   **CRM Integration**: Built-in support for pushing qualified leads to external CRMs via the `/api/leads/[id]/push` endpoint.

---

## 🎯 Application Goal
The AI Call Quality Analyzer is designed to **standardize and scale sales quality assurance**. By providing consistent, automated evaluations, it helps sales managers identify top-tier leads instantly and provides training feedback to sales representatives based on AI-generated reasoning.
