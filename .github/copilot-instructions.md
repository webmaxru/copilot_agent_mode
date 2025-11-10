# OctoCAT Supply Chain Management Application – General Copilot Instructions

These are repository-wide guidelines. Path‑scoped files in `.github/instructions/*.instructions.md` provide focused guidance for specific areas (frontend, API, database).

## Project Overview
This is a TypeScript-based supply chain management demo application showcasing GitHub Copilot capabilities. The system demonstrates modern development practices with AI-assisted coding, automated testing, security scanning, and DevOps workflows.

**Tech Stack:**
- **Backend:** Express.js REST API with TypeScript, SQLite database, repository pattern, Swagger/OpenAPI docs
- **Frontend:** React 18+ with TypeScript, Vite build tool, Tailwind CSS
- **Testing:** Jest for API, React Testing Library for frontend
- **DevOps:** Docker, optional Azure deployment with Bicep

## How to Build and Test

### Setup
```bash
# Install dependencies
npm install

# Initialize database (migrations + seed data)
npm run db:init --workspace=api
```

### Build
```bash
# Build everything
npm run build

# Build specific workspace
npm run build --workspace=api
npm run build --workspace=frontend
```

### Development
```bash
# Start both API and frontend with hot reload
npm run dev

# Or start individually
npm run dev:api
npm run dev:frontend
```

### Testing
```bash
# Run all tests
npm run test

# Test specific workspace
npm run test:api
npm run test:frontend

# Lint frontend code
npm run lint
```

**Ports:** API runs on port 3000, Frontend on port 5137

For complete build documentation, see `docs/build.md`.

## High-Level Architecture
TypeScript monorepo with:
- `api/` Express REST API (SQLite persistence, repository pattern, Swagger docs)
- `frontend/` React + Vite + Tailwind UI
- Shared demo + infra docs under `docs/` and deployment scripts under `infra/`

Refer to `docs/architecture.md` and `docs/sqlite-integration.md` for deeper details. Avoid restating them in reviews and link instead.

## General Review Guidance
When generating suggestions:
1. Prefer incremental, minimal diffs; preserve existing style and naming.
2. Surface security, correctness, and data integrity issues before micro-optimizations.
3. Encourage type safety (no `any` unless justified). Suggest adding/refining model or DTO types when gaps appear.
4. Flag duplicate logic that belongs in a shared utility or repository method.
5. Ensure error handling uses existing custom error types where appropriate (e.g., NotFound, Validation, Conflict) and propagates consistent HTTP status codes via middleware.
6. Encourage tests: request unit tests for new repository logic and component tests (or at least React Testing Library coverage) for critical UI paths.
7. For performance concerns, highlight N+1 query patterns, unnecessary data loading, or large bundle additions.
8. Prefer environment variable driven configuration; avoid hard‑coded paths/secrets.

## Monorepo Workflow
- Build frequently: `npm run build --workspace=api` or `--workspace=frontend` (root build runs both)
- Keep PRs scoped: code + tests + docs (architecture or build notes) when behavior changes.
- Update related instruction files if new folders or architectural slices are introduced.

## Do Not Repeat
Do not inline full API route or component files in review feedback unless absolutely necessary: quote only the lines requiring change. Summarize low‑impact nits.

## Escalation Order for Suggestions
1. Security / data integrity
2. Logical / functional correctness
3. Performance / scalability
4. Maintainability / duplication
5. Readability / consistency
6. Style / minor formatting

## Tone & Feedback Style
Be concise, actionable, and cite a rationale ("because" clause) for non-trivial recommendations. Offer one preferred solution; optionally a lightweight alternative.

## Coding Conventions
- **Language:** TypeScript throughout; avoid `any` types unless explicitly justified
- **Naming:** camelCase in TypeScript/JavaScript; snake_case in SQL columns
- **Style:** Use Prettier for formatting (configuration in `package.json`); single quotes, semicolons, 100-char line width
- **Imports:** Organize imports logically; no unused imports
- **Error Handling:** Use custom error classes (NotFound, Validation, Conflict) with appropriate HTTP status codes
- **Testing:** Write tests for new features; maintain or improve test coverage
- **Documentation:** Update API docs (Swagger) when modifying endpoints; comment complex logic

## Forbidden Actions
The following actions are **prohibited** to maintain code quality and security:

1. **Do not commit secrets:** No API keys, tokens, passwords, or sensitive data in source code or git history
2. **Do not modify migration files:** Existing SQL migration files in `api/sql/migrations/` are immutable; create new sequential files for schema changes
3. **Do not disable security features:** Keep foreign keys enabled, maintain parameterized queries, preserve CORS settings
4. **Do not install packages without justification:** Avoid adding new dependencies unless necessary; prefer existing libraries
5. **Do not bypass type safety:** Avoid `any` types; use proper TypeScript types and interfaces
6. **Do not break existing tests:** All existing tests must pass; fix or update tests as needed, don't remove them
7. **Do not modify files outside project scope:** Stay within `api/`, `frontend/`, `docs/`, and project root; avoid system files
8. **Do not merge without review:** All changes require human review and approval before merging

## Custom Agents
This repository includes custom agents for specialized tasks:
- **BDD Agent:** Create Behavior-Driven Development feature files from requirements
- **RefinePrompt Agent:** Transform vague prompts into clear, executable instructions

Use `@` mention to invoke agents in issues and pull requests.

---
If new subsystems are added (e.g., `mobile/`, `worker/`), create a new `*.instructions.md` with `applyTo` globs instead of bloating this file.
