# Spur AI Customer Support Platform

A production-grade AI-powered customer support application built for the Spur Founding Full-Stack Engineer assignment.

## Live Demo

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Database**: Neon PostgreSQL

---

## Local Setup

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Groq](https://console.groq.com) API key

### 1. Install Dependencies

Ensure you have the codebase extracted locally.

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
GROQ_API_KEY="your_groq_api_key"
PORT=3001
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

### 3. Database Setup

```bash
cd backend

# Sequelize auto-syncs tables on first start.
# Seed the knowledge base with company data:
npm run db:seed
```

### 4. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Running at http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `GROQ_API_KEY` | Groq API key | ✅ |
| `REDIS_URL` | Redis cache connection string (optional) | ❌ |
| `PORT` | Backend server port (default: 3001) | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ |
| `NODE_ENV` | `development` or `production` | ❌ |

### Frontend (`frontend/.env`)

No environment variables required for local dev — the Vite dev server proxies `/api` to `localhost:3001`.

For production (Vercel), set:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (e.g. `https://your-app.onrender.com`) |

---

## Architecture Overview

### Backend — Layered Architecture

The backend follows a **clean, layered architecture** where each layer has a single responsibility. Dependencies always point inward (a Controller never touches the database directly; it must go through a Service, which goes through a Repository). This makes the code testable, maintainable, and easy to extend.

```
backend/src/
├── app.ts                          # Express app bootstrap (middleware stack, routes, error handlers)
├── routes/
│   └── chat.routes.ts              # Maps HTTP endpoints to controller methods
├── controllers/
│   └── chat.controller.ts          # Thin HTTP layer — extracts request data, delegates to services
├── services/
│   ├── chat.service.ts             # Core orchestrator — coordinates the full message lifecycle
│   ├── conversation.service.ts     # Session management + history formatting for LLM
│   └── llm.service.ts              # Groq Llama 3.3 70B provider (implements LLMProvider interface)
├── repositories/
│   ├── conversation.repository.ts  # Conversation CRUD — abstracts Sequelize queries
│   └── message.repository.ts       # Message CRUD — abstracts Sequelize queries
├── middleware/
│   ├── validation.middleware.ts    # Generic Zod schema validation factory
│   └── error.middleware.ts         # Global error handler (catches AppError, Sequelize, LLM errors)
├── validators/
│   └── chat.validator.ts           # Zod schemas for request validation
├── db/
│   ├── sequelize.ts                # Sequelize connection instance (reads DATABASE_URL)
│   ├── redis.ts                    # Redis client with graceful degradation
│   ├── index.ts                    # DB sync + model associations (hasMany/belongsTo)
│   └── models/
│       ├── Conversation.ts         # Conversation model (UUID primary key, timestamps)
│       ├── Message.ts              # Message model (belongs to Conversation, sender enum)
│       └── KnowledgeBase.ts        # Static knowledge base model (company policies)
├── scripts/
│   └── seed.ts                     # Seeds the KnowledgeBase with fictional store policies
└── types/
    └── index.ts                    # Shared TypeScript interfaces + custom error classes
```

#### Layer Responsibilities

| Layer | Responsibility | Example |
|---|---|---|
| **Routes** | Maps HTTP verbs + paths to controller methods. Applies validation middleware. | `POST /api/chat/message → validate(schema) → controller.sendMessage()` |
| **Controllers** | Extracts data from `req.body` / `req.params`, calls the appropriate service, and sends the HTTP response. Contains zero business logic. | Pulls `message` and `sessionId` from body, calls `chatService.processMessage()` |
| **Services** | Contains all business logic. Orchestrates multiple repositories and external APIs. | `chat.service` saves the user message, fetches history, calls Groq LLM, saves AI reply |
| **Repositories** | Thin data-access layer that wraps Sequelize queries. Returns plain JSON objects (not Sequelize instances). | `messageRepository.create()`, `conversationRepository.findById()` |
| **Models** | Sequelize model definitions that map to PostgreSQL tables. | `Conversation`, `Message`, `KnowledgeBase` |
| **Middleware** | Cross-cutting concerns (validation, error handling, logging). | Zod validation runs before controllers; global error handler catches everything |

#### Dependency Flow

```
Routes → Controllers → Services → Repositories → Database (PostgreSQL)
                          ↓
                     LLM Service → Groq API (Llama 3.3 70B)
                          ↓
                     Redis Cache (optional, graceful fallback)
```

### Design Decisions

1. **Repository Pattern**: Instead of calling `Model.findAll()` directly in services, all DB queries go through repository files. This means if we ever swap Sequelize for Prisma or raw SQL, we only change the repository layer — services remain untouched.

2. **Singleton Services**: `chatService`, `llmService`, and repositories are exported as singleton instances (not classes you need to `new` up). This keeps the codebase simple and avoids dependency injection complexity for a project of this size.

3. **Optimistic UI**: The frontend shows the user's message bubble instantly (before the API even responds). If the API call fails, the message is silently removed. This makes the chat feel lightning fast.

4. **Redis with Graceful Degradation**: The Knowledge Base is cached in Redis using the Cache-Aside pattern. If Redis is unavailable (no server running, connection lost), the app automatically falls back to querying PostgreSQL. The server never crashes due to a missing cache.

5. **Custom Error Classes**: Instead of generic `throw new Error()`, we use typed error classes (`AppError`, `LLMError`, `DatabaseError`, `RateLimitError`) with HTTP status codes baked in. The global error middleware maps these to appropriate HTTP responses automatically.

6. **Zod Validation Middleware**: A reusable `validate(schema)` factory function that can wrap any Zod schema. Adding validation to a new endpoint is a single line: `router.post('/endpoint', validate(mySchema), controller.method)`.

---

### Message Processing Flow

This is the complete journey of a user message — from typing it on the frontend to receiving the AI reply:

```mermaid
flowchart TD
    A["👤 User types a message"] --> B["📡 Frontend sends POST /api/chat/message"]
    B --> C["🔍 Router validates input (Zod schema)"]
    C --> D["🎯 Controller extracts message + sessionId"]
    D --> E["⚙️ ChatService.processMessage()"]
    E --> F{"Session exists?"}
    F -- Yes --> G["Load existing Conversation from DB"]
    F -- No --> H["Create new Conversation in DB"]
    G --> I["Save user message to Messages table"]
    H --> I
    I --> J["Fetch last 20 messages as history"]
    J --> K["Remove current message from history (avoid duplication)"]
    K --> L{"Redis cache available?"}
    L -- Hit --> M["Load KnowledgeBase from Redis"]
    L -- Miss --> N["Fetch KnowledgeBase from PostgreSQL → cache in Redis"]
    M --> O["🤖 GroqProvider.generateReply()"]
    N --> O
    O --> P["Build System Prompt + KB context"]
    P --> Q["Format history as chat messages"]
    Q --> R["📤 Send to Groq API (Llama 3.3 70B)"]
    R --> S["📥 Receive AI response text"]
    S --> T["Save AI message to Messages table"]
    T --> U["Return reply + sessionId to Controller"]
    U --> V["📡 Controller sends JSON response to Frontend"]
    V --> W["💬 Frontend renders AI bubble on screen"]

    style A fill:#3b82f6,color:#fff
    style W fill:#3b82f6,color:#fff
    style O fill:#10b981,color:#fff
    style R fill:#f59e0b,color:#fff
    style S fill:#f59e0b,color:#fff
```

---

### Frontend Architecture

```
frontend/src/
├── components/
│   ├── ChatWindow.tsx       # Main chat container — renders messages, input, and empty state
│   ├── ChatMessage.tsx      # Individual message bubble with markdown rendering (ReactMarkdown)
│   ├── ChatInput.tsx        # Auto-resizing textarea + send button
│   ├── TypingIndicator.tsx  # Animated dots while AI responds
│   ├── SuggestedQuestions.tsx  # Quick-start question chips for empty state
│   └── Sidebar.tsx          # Conversation history list + dark mode toggle
├── hooks/
│   └── useChat.ts           # Custom hook: all chat state, API calls, optimistic UI, session persistence
├── services/
│   └── api.ts               # Typed Axios API client (auto-resolves base URL for dev/prod)
├── types/
│   └── index.ts             # Frontend TypeScript interfaces
├── App.tsx                  # Root layout — sidebar + chat area + dark mode state
├── main.tsx                 # React DOM entry point
└── index.css                # Global styles + Tailwind CSS imports
```

### Database Schema (Sequelize Models)

| Model | Table | Purpose | Key Fields |
|---|---|---|---|
| `Conversation` | `conversations` | Stores each chat session | `id` (UUID), `createdAt`, `updatedAt` |
| `Message` | `messages` | Stores every chat bubble | `id` (UUID), `conversationId` (FK), `sender` (user/ai), `content` (TEXT) |
| `KnowledgeBase` | `knowledge_base` | Company FAQ / policy bank | `id` (UUID), `title`, `content` (TEXT), `category` |

**Relationships:**
- A `Conversation` **has many** `Messages`
- A `Message` **belongs to** one `Conversation`
- `KnowledgeBase` is standalone — it feeds context to the AI, not tied to any conversation

---

## LLM Integration Notes

### Provider: Groq (Llama 3.3 70B Versatile)

We use the `groq-sdk` to call `llama-3.3-70b-versatile` via Groq's chat completions API. Groq runs LLM inference on custom LPU (Language Processing Unit) hardware, delivering extremely low latency responses — typically 10-20x faster than traditional GPU-based providers.

### Prompting Strategy

The AI receives **three pieces of context** on every message:

#### 1. System Prompt (Behavioral Instructions)
A carefully crafted system instruction that defines the AI's persona and rules:

```
You are a professional customer support agent for our e-commerce store.

Your responsibilities:
- Answer customer questions clearly, concisely, and helpfully
- Only provide information that exists in the company's knowledge base
- If the answer is not in the knowledge base, politely say so and suggest contacting support
- Maintain conversational context across the chat history
- Be warm, professional, and customer-friendly
- Format responses with markdown (bullet points, bold)
- Keep responses concise: 2-4 sentences for simple questions, bullet points for complex ones
- Never make up information, pricing, or policies not in the knowledge base
```

#### 2. Knowledge Base (Injected into the System Prompt)
The entire `KnowledgeBase` table is fetched from the database (or Redis cache), formatted as markdown sections, and appended to the system prompt:

```
## Company Knowledge Base

### Shipping Policy
We offer free standard shipping on all orders over $50...

---

### Return and Refund Policy
We have a 30-day hassle-free return policy...

---

### Customer Support Hours
Monday through Friday, 9:00 AM to 6:00 PM EST...
```

This approach grounds the AI in factual data and dramatically reduces hallucination.

#### 3. Conversation History (Context Window)
The last 20 messages from the current session are formatted as a dialogue script:

```
Customer: What is your return policy?

Support Agent: We offer a 30-day hassle-free return policy...

Customer: How long does the refund take?

Support Agent:
```

The AI generates the continuation of this script. This preserves multi-turn conversational context so the AI can reference earlier parts of the conversation naturally.

### LLM Configuration

| Parameter | Value | Rationale |
|---|---|---|
| `model` | `llama-3.3-70b-versatile` | High quality 70B parameter model with ultra-fast inference on Groq LPU hardware |
| `temperature` | `0.7` | Balanced — creative enough for natural conversation, not so high it hallucinates |
| `max_tokens` | `1024` | Prevents excessively long responses for a support chat context |

### LLM Provider Abstraction

The LLM layer is built behind a swappable `LLMProvider` interface:

```typescript
interface LLMProvider {
  generateReply(
    history: LLMHistoryEntry[],
    userMessage: string,
    knowledgeBase: string[]
  ): Promise<string>;
}
```

Switching providers requires changing exactly **one line**:

```typescript
// Current
export const llmService: LLMProvider = new GroqProvider();

// Future — no other code changes needed
export const llmService: LLMProvider = new OpenAIProvider();
export const llmService: LLMProvider = new ClaudeProvider();
```

### Error Handling for LLM

The `GroqProvider` catches and classifies all Groq API errors:

| Error Type | Detection | HTTP Status | User Message |
|---|---|---|---|
| Rate Limit | `rate_limit`, `429` | `429` | "AI service rate limit reached. Please try again." |
| Invalid API Key | `invalid_api_key`, `401`, `403` | `503` | "AI service unavailable" |
| Unknown | Everything else | `503` | "AI service temporarily unavailable." |

---

## API Endpoints

### `POST /api/chat/message`

Send a message and receive an AI reply.

**Request:**
```json
{
  "message": "What is your refund policy?",
  "sessionId": "optional-uuid"
}
```

**Validation (Zod):**
- `message`: Required string, trimmed, 1-5000 characters
- `sessionId`: Optional UUID string (nullable)

**Response (200):**
```json
{
  "reply": "We have a 30-day hassle-free return policy. Items must be unworn, unwashed, and in their original packaging. Refunds are processed within 5-7 business days.",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### `GET /api/conversations/:id`

Fetch a conversation and its full message history.

**Response (200):**
```json
{
  "conversation": { "id": "...", "createdAt": "..." },
  "messages": [
    { "id": "...", "sender": "user", "content": "What is your refund policy?" },
    { "id": "...", "sender": "ai", "content": "We have a 30-day hassle-free return policy..." }
  ]
}
```

---

### `GET /api/conversations`

List all conversations (for sidebar).

---

### `GET /health`

Health check endpoint — returns server status, timestamp, and version.

---

## Features

- ✅ Real AI responses via Groq (Llama 3.3 70B Versatile) — ultra-fast inference
- ✅ Knowledge Base grounding (shipping, returns, refunds, support hours stored in DB)
- ✅ Redis caching for Knowledge Base (Cache-Aside pattern with graceful fallback)
- ✅ Session management with localStorage persistence
- ✅ Full conversation history restored on page reload
- ✅ Markdown rendering in AI responses (bold, lists, code blocks, links)
- ✅ Typing indicator ("Agent is typing…")
- ✅ Suggested question chips for quick onboarding
- ✅ Conversation sidebar with history navigation
- ✅ Dark / Light mode toggle
- ✅ Input validation with Zod (empty, whitespace, 5000 char limit)
- ✅ Structured error handling (LLM errors, DB errors, rate limits, safety filters)
- ✅ Optimistic UI updates (instant message rendering)
- ✅ Responsive design (mobile-friendly)
- ✅ LLM Provider abstraction (swappable Groq → OpenAI → Claude)

---

## Deployment

### Backend (Render)

1. Deploy the backend code to Render as a **Web Service**
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables: `DATABASE_URL`, `GROQ_API_KEY`, `FRONTEND_URL`, `NODE_ENV=production`

### Frontend (Vercel)

1. Deploy the frontend code to Vercel
2. Set root directory to `frontend`
3. Framework preset: **Vite**
4. Add environment variable: `VITE_API_URL=https://your-render-app.onrender.com`

### Database (Neon)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Set as `DATABASE_URL` in both local `.env` and Render environment variables

---

## Trade-offs & Decisions

### Why Groq (Llama 3.3 70B)?
- **Speed**: Groq's custom LPU hardware delivers inference speeds 10-20x faster than traditional GPU providers, critical for a chat UX where users expect near-instant replies
- **Quality**: Llama 3.3 70B is a highly capable open-source model with excellent instruction-following and reasoning abilities
- **Context window**: 8192 token context window comfortably handles conversation histories
- **Cost**: Groq offers a generous free tier for development and demo purposes
- **Open ecosystem**: Built on Meta's open-source Llama models, avoiding vendor lock-in to any single proprietary AI provider

### Why PostgreSQL (Neon)?
- **Relational fit**: Conversations → Messages is a natural one-to-many relationship that maps perfectly to relational tables
- **UUID primary keys**: Prevents ID enumeration attacks (users can't guess other session IDs)
- **Extensibility**: Could add full-text search via `pg_trgm` for knowledge base search later
- **Neon specifically**: Serverless PostgreSQL with built-in connection pooling — handles Render's cold starts gracefully without connection exhaustion

### Why Redis for Knowledge Base Caching?
- **Problem**: The entire `knowledge_base` table was being queried from PostgreSQL on every single chat message, even though it rarely changes
- **Solution**: Cache-Aside Pattern — first check Redis (`kb:all_entries`), only hit Postgres on a cache miss, then populate Redis with a 1-hour TTL
- **Graceful Degradation**: If Redis is unavailable (not installed, connection lost), the app silently falls back to PostgreSQL. The server never crashes due to a missing cache layer

### Why Sequelize (not Prisma)?
- **Simplicity**: Models are defined as plain TypeScript classes — no code generation step, no `prisma generate`, no schema file to keep in sync
- **Auto-sync**: `sequelize.sync({ alter: true })` creates and updates tables automatically during development, eliminating the need for manual migrations
- **Portability**: No external CLI dependency; the entire ORM is self-contained in `node_modules`

### Why Zod (not Joi or express-validator)?
- **TypeScript-first**: Zod schemas automatically infer TypeScript types (`z.infer<typeof schema>`), so validation and typing stay in sync
- **Composable**: Schemas can be combined, extended, and reused across endpoints
- **Tiny bundle**: ~13KB — significantly smaller than Joi

---

## Limitations (Known)

| Limitation | Impact | Workaround |
|---|---|---|
| No authentication | Anyone with the session UUID can access a conversation | For a demo/assignment this is acceptable; production would need JWT auth |
| Knowledge base is static | Policies can only be updated by re-running `npm run db:seed` | An admin panel with CRUD endpoints would solve this |
| No streaming responses | Users see the full response appear at once after a delay | Groq supports streaming; adding SSE is straightforward |
| No rate limiting | A malicious user could spam the Groq API | `express-rate-limit` middleware per IP would prevent abuse |
| Full KB loaded every time | Works fine for small KB, but won't scale to thousands of articles | RAG with vector embeddings would fetch only relevant articles |

---

## If I Had More Time…

### Streaming Responses (SSE)
Replace the current request/response cycle with **Server-Sent Events**. Groq's streaming API returns tokens incrementally — piping these through an SSE connection would show the AI "typing" word-by-word, dramatically improving perceived responsiveness.

### RAG (Retrieval-Augmented Generation)
Instead of loading the entire Knowledge Base into every prompt, I would:
1. Generate vector embeddings for each KB article using an embedding model (e.g., `text-embedding-3-small`)
2. Store embeddings in PostgreSQL using the `pgvector` extension
3. On each user message, embed the question and run a cosine similarity search to retrieve only the top 3 most relevant articles
4. Pass only those articles to the LLM — reducing token usage and improving answer precision

### Multi-Channel Support
The `chat.service.ts` orchestrator is already decoupled from HTTP. Adding WhatsApp or Instagram support would mean:
1. Adding a new webhook route for each channel
2. Creating a thin adapter that converts the channel's payload format into our `ChatRequest` interface
3. Calling the exact same `chatService.processMessage()` — zero business logic duplication

### Authentication & Authorization
- JWT-based user accounts so conversations are tied to authenticated users
- Role-based access (admin can manage KB, users can only chat)
- Session tokens with expiry instead of raw UUID lookups

### Admin Panel
A simple React dashboard to:
- Add, edit, and delete Knowledge Base entries without re-seeding
- View conversation analytics (most common questions, response times)
- Monitor AI performance and flag problematic responses

### Automated Testing
- **Unit tests**: Jest tests for each service and repository with mocked dependencies
- **Integration tests**: Supertest for API endpoint testing with a test database
- **E2E tests**: Playwright or Cypress for full user flow testing (type message → receive AI reply → switch conversations)

