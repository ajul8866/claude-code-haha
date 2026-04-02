---
name: skill-development
description: Creates new bundled skills following the project's skill pattern. Use when user says 'create a skill', 'add a bundled skill', 'new skill', 'make a reusable prompt template', or when working in `src/skills/`. Handles prompt definition, optional file attachments, and index.ts registration. Do NOT use for slash commands (use src/commands/) or regular prompts.
paths:
  - src/skills/bundled/*.ts
  - src/skills/register.ts
---

# Skill Development

## Critical

1. **All skills MUST be created in `src/skills/bundled/`** - no exceptions
2. **Every skill MUST be registered in `src/skills/bundled/index.ts`** - unregistered skills are never loaded
3. **Skill names MUST be kebab-case** (e.g., `git-commit`, `api-route`)
4. **The `registerBundledSkill` function MUST be called at module scope** - not inside functions

## Instructions

### Step 1: Create the skill file

Create a new TypeScript file in `src/skills/bundled/` with a kebab-case name.

Example file path: `src/skills/bundled/my-skill.ts`

Boilerplate template:

```typescript
import { registerBundledSkill } from '../register'

registerBundledSkill({
  name: 'my-skill',
  description: 'Brief description of what the skill does and when to use it',
  prompt: `{Detailed skill prompt content here}

## Instructions

1. Step-by-step instructions
2. Each step should be actionable
3. Include expected outputs

## Examples

User says: "example trigger"
Actions taken:
- Step 1
- Step 2
Result: Expected output
`,
})
```

**Validation gate**: Verify the file exists at `src/skills/bundled/my-skill.ts` and imports `registerBundledSkill` from `'../register'`.

### Step 2: Register the skill in index.ts

Open `src/skills/bundled/index.ts` and add an import for your new skill.

Pattern:

```typescript
import './my-skill'
```

The import order should follow alphabetically with other skill imports.

**Validation gate**: Verify the import statement is present in `src/skills/bundled/index.ts` and there are no TypeScript errors.

### Step 3: Verify skill loads at runtime

Run the CLI and verify the skill is loaded:

```bash
bun --env-file=.env ./src/entrypoints/cli.tsx
```

Skills are loaded during initialization via `initBundledSkills()`.

**Validation gate**: Check that running the application does not throw import errors for the new skill.

### Step 4: Optional - Add file attachments

If the skill needs to include reference files (examples, templates):

```typescript
import { registerBundledSkill } from '../register'

registerBundledSkill({
  name: 'my-skill',
  description: 'Description',
  prompt: '...',
  files: [
    // File paths relative to project root
    'src/examples/example-file.ts',
    'templates/template.txt',
  ],
})
```

Files are resolved at runtime and attached to the skill context.

## Examples

**User says**: "Create a skill for generating API routes"

**Actions taken**:

1. Create file `src/skills/bundled/api-route.ts`:

```typescript
import { registerBundledSkill } from '../register'

registerBundledSkill({
  name: 'api-route',
  description:
    'Creates new API routes with proper error handling. Use when user says "create route", "add endpoint", or "new API".',
  prompt: `# API Route Creation

## Instructions

1. Create file in src/routes/ with pattern {name}.ts
2. Export handler function matching RouteHandler type
3. Include input validation and error responses

## Validation

Verify route compiles: bun run build
`,
})
```

2. Add to `src/skills/bundled/index.ts`:

```typescript
import './api-route'
```

3. Verify: `bun --env-file=.env ./src/entrypoints/cli.tsx`

**Result**: New skill `api-route` available for use in sessions.

## Common Issues

**Error: `registerBundledSkill is not defined`**

1. Check import path: Must be `'../register'` (relative from bundled/ directory)
2. Verify `src/skills/register.ts` exports `registerBundledSkill`

**Error: `Skill not appearing in session`**

1. Check `src/skills/bundled/index.ts` has the import
2. Verify skill file is in `src/skills/bundled/` (not `src/skills/`)
3. Check for syntax errors preventing module load: `bun run build`

**Error: `Cannot find module '../register'`**

1. Verify you're creating the file in `src/skills/bundled/`, not `src/skills/`
2. File path must be exactly `src/skills/bundled/my-skill.ts`

**Error: `Files not found in skill context`**

1. File paths in `files` array must be relative to project root
2. Files must exist at resolution time - check paths with `ls {path}`
3. Use forward slashes in paths regardless of OS
