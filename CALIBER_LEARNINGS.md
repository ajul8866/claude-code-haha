# Caliber Learnings

Accumulated patterns and anti-patterns from development sessions.
Auto-managed by [caliber](https://github.com/caliber-ai-org/ai-setup) — do not edit manually.

- **[fix]** When using OpenAI-compatible endpoints (like Ollama's remote proxy) with Caliber, you must add `"fastModel": "<your-model>"` to `~/.caliber/config.json` — Caliber defaults to `gpt-5.4-mini` for the 'openai' provider which won't exist on custom endpoints, causing 404 errors during init/refresh
- **[gotcha]** Caliber requires `baseUrl` to include the `/v1` suffix for OpenAI-compatible APIs — `http://localhost:11434` will fail with 404 errors; use `http://localhost:11434/v1` instead
- **[env]** For OpenAI-compatible endpoints through Ollama remote proxy, the minimal working config is: `{"provider": "openai", "model": "<model>", "fastModel": "<model>", "baseUrl": "http://localhost:11434/v1", "apiKey": "..."}`
- **[gotcha]** The `Glob` tool consistently returns empty results in this repository — use `find` commands via Bash instead (e.g., `find /root/claude-code-haha/src -type f -name "*.tsx"`)
- **[fix]** When `Grep` tool returns empty results, use `find ... | xargs grep` via Bash as a workaround
