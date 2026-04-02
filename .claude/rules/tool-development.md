---
paths:
  - src/tools/**
  - src/utils/permissions/**
---

# Tool Development

All tools follow the pattern in `src/tools/*/Tool.ts`.

## Structure

Each tool directory contains:

- `Tool.ts` — Main implementation (class extending `Tool`)
- `prompt.ts` — Prompt text for the LLM
- `constants.ts` — Tool-specific constants

## Implementation Pattern

```typescript
// src/tools/MyTool/Tool.ts
import { Tool } from '../../Tool.js'
import { MY_TOOL_PROMPT } from './prompt.js'

export class MyTool extends Tool {
  name = 'MyTool'
  prompt = MY_TOOL_PROMPT

  async call(params: MyToolParams, context: ToolUseContext): Promise<ToolResult> {
    // Implementation
  }
}
```

## Permission Patterns

Tools requiring permissions register patterns in `src/utils/permissions/`:

- Use glob patterns like `Bash(npm:*)` for command-scoped permissions
- Check permissions via `context.toolPermissionContext`

## Output Format

Return structured results:

- `{ type: 'text', value: string }`
- `{ type: 'error', value: string }`
- `{ type: 'image', data: string, mediaType: string }`
