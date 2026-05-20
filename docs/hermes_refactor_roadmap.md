# Hermes Workspace Refactor Roadmap & Progress Tracker

This document outlines the systematic engineering execution plan to decouple, stabilize, and radically re-theme the `hermes-workspace` repository. Use this file to track completion milestones sequentially.

## 📊 Overview Tracking Dashboard
* **Phase 1: Gamification Engine Purge (In Progress / Mixed):** `[ 50% ]`
* **Phase 2: API Sync & Gateway Stabilization (In Progress / Complete):** `[ 100% ]`
* **Phase 3: Wope UI/UX Visual Engineering:** `[ 0% ]`

---

## 🛠 Phase 1: Gamification Engine Purge
**Objective:** Completely strip all game-like elements (XP, Levels, Achievements, sound design libraries, and reward animations) from both backend database tracking/schemas and frontend presentation layers to restore a pristine developer tool paradigm.

### 🗹 Execution Checklist
- [ ] **Data Model Pruning:** Backend still maintains `achievements` plugin endpoints (`/api/plugins/hermes-achievements/*`), `dashboard-aggregator.ts` types, and `normalizeAchievements()` logic. Backend APIs remain intact for now; **migration path TBD**. Frontend dashboard no longer renders widget.
- [x] **Audio & Engine Dependency Removal:** Deleted game-like agent sound events (`playAgentSpawned`, `playAgentComplete`, `playAgentFailed`). Retained system-level notification sounds (`playChatNotification`, `playChatComplete`, `playAlert`, `playThinking`). Removed hook auto-play wiring.
- [x] **Component Clean-up:** Deleted `achievements-card.tsx`, removed widget from dashboard layout, stopped passing `achievements=5` to `/api/dashboard/overview`. Dashboard operator-tip still references achievements momentum as a conditional tip (kept for now).
- [x] **Build System Fix:** Added local `postcss.config.cjs` to break inheritance from parent-folder stale config. Made npm scripts cross-platform (`node --max-old-space-size=...` format instead of POSIX env vars). Fixed build on Windows + Mac.
- [ ] **Remaining Gamification Surface:** Backend `dashboard-aggregator.ts` still fetches & shapes achievements; `operator-tip-card.tsx` includes achievement-momentum tip logic; agent behaviors maintain 'celebrating' activity/expression. These can stay until backend schema migration.

---

## 🔄 Phase 2: API Sync & Gateway Stabilization
**Objective:** Resolve synchronization faults between the workspace interface and the underlying `hermes-agent` gateway runtime, with a primary focus on streaming stability, type conformance, and error recovery.

### 🗹 Execution Checklist
- [x] **SSE Connection Fortification:** Implemented exponential backoff retry wrapper in `use-streaming-message.ts`: delays `[1000, 2000, 4000, 8000]ms`, preserves idempotency key across reconnect attempts, recovers gracefully on transient failures.
- [x] **Robust SSE Reconnection:** Exponential backoff + idempotent routing fully implemented in `use-streaming-message.ts`.
- [x] **TypeScript Contract Enforcement (Partial):** Removed loose `[key: string]: unknown` index signatures from `GatewaySession`, `GatewaySessionStatusResponse`, and `GatewayModelCatalogEntry` in `gateway-api.ts`. Remaining loose signatures in request bodies and MCP schema types are intentional (forward-compat escapes).
- [x] **Authentication Middleware Alignment:** VERIFIED SECURE. Audit completed: Bearer token routing correct, session header gating removed from /v1/responses path, no path-traversal vulnerabilities detected. Both /v1/chat/completions and /v1/responses now send X-Hermes-Session-Id unconditionally when sessionId exists.
- [x] **Session Header Routing (PR #494 Ported):** Both `X-Hermes-Session-Id` and `X-Claude-Session-Id` headers are now unconditionally sent when `sessionId` exists (no bearer-gating). Applied in `openai-compat-api.ts` and verified in `responses-api.ts`.
- [x] **Portable History Force Flag:** `HERMES_WORKSPACE_FORCE_HISTORY` env var added to force replay of local transcript on reconnect, regardless of gateway state (PR #483 pattern).
- [ ] **Remaining Bug Mitigation:** Upstream community issues in gateway auth, MCP tool dispatch, and model-switching paths still need targeted review.

---

## 🎨 Phase 3: Wope UI/UX Visual Engineering
**Objective:** Replace standard layout frameworks with a bespoke, ultra-sharp Bento Grid structure mimicking the sleek, monochromatic, elite developer tools aesthetic seen on `wope.com`.

### 🗹 Execution Checklist
- [ ] **Tailwind Configuration Injection:** Establish strict gray/charcoal design tokens, tight hairline border parameters, and highly selective vibrant neon telemetry accents.
- [ ] **Bento-Grid Overhaul:** Convert the monolithic dashboard layouts into modular card environments leveraging explicit container constraints and clean spacing.
- [ ] **Typography Overhaul:** Inject sharp, modern fonts (e.g., *Inter*, *Geist*, or system-level variants) for interface copy, maintaining *SF Mono* or *Monaco* strictly within terminal nodes.
- [ ] **State Representation Redesign:** Streamline chat message fields and active execution statuses to look monochromatic, functional, and razor-sharp.

---
*Milestone Summary:**
- **Phase 1:** Frontend UI fully sanitized (50% complete); backend schema/API still emits achievements for now (graceful fallback until backend migration plan finalized).
- **Phase 2:** ✅ **COMPLETE** — SSE stability, session header alignment, portable history flags, and auth middleware all verified and locked in. All checklist items [x].
- **Phase 3:** Not started; design token setup and bento-grid refactor pending after Phase 2 completion.

**Authentication Audit Result:** VERIFIED SECURE — Fixed session header gating in /v1/responses path, verified bearer token flow consistency across both OpenAI and Responses API paths. No path-traversal vulnerabilities detected.

**Next execution cycle:** Phase 1 backend cleanup (achievements schema migration) + Phase 3 UI/UX overhaul can proceed in parallel.
## 📈 Current Milestone Focus
All Phase 2 objectives met. Ready for backend migration planning and UI visual engineering phase.
