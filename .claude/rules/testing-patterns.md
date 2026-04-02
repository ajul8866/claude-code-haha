---
paths:
  - '**/*.test.ts'
  - '**/*.spec.ts'
---

# Testing Patterns

Tests use Vitest. Configuration in `vitest.config.ts`.

## Test Location

- Place test files adjacent to source: `src/utils/foo.ts` → `src/utils/foo.test.ts`
- Alternative: `src/utils/foo.spec.ts`

## Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('MyModule', () => {
  beforeEach(() => {
    // Setup
  })

  afterEach(() => {
    // Teardown
  })

  it('should do something', () => {
    expect(true).toBe(true)
  })

  it('should handle async', async () => {
    const result = await asyncFunction()
    expect(result).toBeDefined()
  })
})
```

## Coverage Thresholds

From `vitest.config.ts`:

- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Running Tests

```bash
bun test           # Run all tests
bun test --watch   # Watch mode
bun test --coverage # With coverage
```

## Mocking

Use Vitest's built-in mocking:

```typescript
import { vi } from 'vitest'

vi.mock('../../utils/file.js', () => ({
  readFile: vi.fn().mockResolvedValue('content'),
}))
```
