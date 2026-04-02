# Claude Code Haha

A **locally runnable version** of Claude Code supporting Anthropic-compatible API endpoints (MiniMax, OpenRouter, etc.).

## Architecture

**Entry**: `src/entrypoints/cli.tsx` → `src/main.tsx` · **TUI**: React + Ink in `src/ink/` and `src/components/`

**Core Modules**:

- **Tools** (`src/tools/`): `BashTool/`, `EditTool/`, `GrepTool/`, `MCPTool/`, `FileReadTool/`, `FileWriteTool/`, etc.
- **Commands** (`src/commands/`): Slash commands (`/mcp`, etc.)
- **Skills** (`src/skills/`): Bundled skills loaded via `initBundledSkills()`
- **Services** (`src/services/`): `api/`, `mcp/`, `lsp/`
- **State** (`src/state/`): AppState management via React hooks

**Supporting Directories**:

- `.husky/` — Git hooks (`pre-commit`) for linting
- `docs/` — Architecture diagrams (`00runtime.png`, `01-overall-architecture.png`)
- `scripts/` — Build utilities (`build.ts`)
- `stubs/` — Type stubs for native modules (`ant-claude-for-chrome-mcp.ts`, `color-diff-napi.ts`)

**Key Flows**:

- Message processing: `src/main.tsx` → `src/screens/REPL.tsx`
- Tool execution: `src/Tool.ts` → `src/tools/*/Tool.ts`
- Permission handling: `src/utils/permissions/` → `src/components/permissions/`

## Commands

```bash
bun install                    # Install dependencies
./bin/claude-haha              # Start TUI (macOS/Linux)
bun --env-file=.env ./src/entrypoints/cli.tsx -p "prompt"  # Windows
```

```bash
bun test                        # Run tests (vitest)
bun run build                   # Build project
bun run lint                    # Lint (biome)
```

```bash
bun run check                   # Type check (TypeScript)
bun run format                  # Format code (biome format)
```

## Environment

```env
ANTHROPIC_API_KEY=sk-xxx        # API key (x-api-key header)
ANTHROPIC_AUTH_TOKEN=sk-xxx    # Bearer token (Authorization header)
ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic  # Custom endpoint
ANTHROPIC_MODEL=MiniMax-M2.7-highspeed  # Model override
DISABLE_TELEMETRY=1            # Disable analytics
CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

## Conventions

**Code Style**: Single quotes, ES5 trailing commas, semicolons as-needed, 2-space indent, 100-char line width (see `biome.json`)

**Tool Pattern** (`src/tools/*/Tool.ts`):

- Export class extending `Tool`
- Provide `prompt`, `constants`, and `call` method
- Register permission patterns in `src/utils/permissions/`

**Command Pattern** (`src/commands/*/index.ts`):

- Export object with `type`, `name`, `description`, `load` (lazy import)
- Types: `'local'` (simple), `'local-jsx'` (React), `'local-jsx-sync'`

**Skill Pattern** (`src/skills/bundled/*.ts`):

- Call `registerBundledSkill({ name, description, prompt, files? })`
- Import in `src/skills/bundled/index.ts`

## Key Files

- `preload.ts` — Bun preload (MACRO globals)
- `tsconfig.json` — TypeScript config (moduleResolution: bundler)
- `vitest.config.ts` — Test config
- `.env.example` — Environment template

<!-- caliber:managed:pre-commit -->

## Before Committing

**IMPORTANT:** Before every git commit, you MUST ensure Caliber syncs agent configs with the latest code changes.

First, check if the pre-commit hook is already installed:

```bash
grep -q "caliber" .git/hooks/pre-commit 2>/dev/null && echo "hook-active" || echo "no-hook"
```

- If **hook-active**: the hook handles sync automatically — just commit normally. Tell the user: "Caliber will sync your agent configs automatically via the pre-commit hook."
- If **no-hook**: run Caliber manually before committing:
  1. Tell the user: "Caliber: Syncing agent configs with your latest changes..."
  2. Run: `caliber refresh && git add CLAUDE.md .claude/ .cursor/ .cursorrules .github/copilot-instructions.md .github/instructions/ AGENTS.md CALIBER_LEARNINGS.md .agents/ .opencode/ 2>/dev/null`
  3. After it completes, briefly tell the user what Caliber updated. Then proceed with the commit.

If `caliber` is not found, tell the user: "This project uses Caliber for agent config sync. Run /setup-caliber to get set up."

<!-- /caliber:managed:pre-commit -->

<!-- caliber:managed:learnings -->

## Session Learnings

Read `CALIBER_LEARNINGS.md` for patterns and anti-patterns learned from previous sessions.
These are auto-extracted from real tool usage — treat them as project-specific rules.

<!-- /caliber:managed:learnings -->

<!-- caliber:managed:sync -->

## Context Sync

This project uses [Caliber](https://github.com/caliber-ai-org/ai-setup) to keep AI agent configs in sync across Claude Code, Cursor, Copilot, and Codex.
Configs update automatically before each commit via `caliber refresh`.
If the pre-commit hook is not set up, run `/setup-caliber` to configure everything automatically.

<!-- /caliber:managed:sync -->
