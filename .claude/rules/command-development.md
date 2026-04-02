---
paths:
  - src/commands/**
---

# Command Development

Slash commands are defined in `src/commands/*/index.ts`.

## Command Types

- `'local'` — Simple command returning text
- `'local-jsx'` — React component for UI
- `'local-jsx-sync'` — Synchronous React component

## Registration Pattern

```typescript
// src/commands/my-command/index.ts
import type { Command } from '../../commands.js'

const myCommand = {
  type: 'local-jsx' as const,
  name: 'my-command',
  description: 'My command description',
  argumentHint: '<args>',
  load: () => import('./my-command.js'),
} satisfies Command

export default myCommand
```

## Component Pattern

```typescript
// src/commands/my-command/my-command.tsx
export async function call(
  onDone: LocalJSXCommandOnDone,
  context: LocalJSXCommandContext,
  args?: string
): Promise<React.ReactNode> {
  return <Dialog onClose={onDone}>...</Dialog>
}
```

## Immediate vs Deferrred

- `immediate: true` — Runs before REPL loop (e.g., `/status`)
- No `immediate` — Runs within REPL context

## Feature Flags

Use `feature('FLAG_NAME')` from `bun:bundle` to gate commands:

```typescript
import { feature } from 'bun:bundle'
import type { Command } from '../../commands.js'

const command: Command = {
  name: 'my-command',
  isEnabled: () => feature('MY_FEATURE'),
  // ...
}
```
