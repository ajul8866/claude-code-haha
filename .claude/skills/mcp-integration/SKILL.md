---
name: mcp-integration
description: Integrates MCP (Model Context Protocol) servers into Claude Code. Use when user says 'add MCP server', 'integrate MCP', 'new tool provider', 'connect tool server', or modifies files in `src/services/mcp/` or `src/tools/MCPTool/`. Handles server lifecycle, tool discovery/registration, resource access, and authentication flows. Do NOT use for regular tool creation (use tool-creation skill instead) or for slash commands.
paths:
  - src/services/mcp/**
  - src/tools/MCPTool/**
  - src/tools/McpAuthTool/**
  - src/utils/permissions/*mcp*
---

# MCP Integration

## Critical

1. **Never connect to untrusted MCP servers** - validate server identity before connecting
2. **All MCP operations must be async** - the SDK uses Promises extensively
3. **Tool names from MCP servers are namespaced** - format is `mcp__<serverName>__<toolName>` to avoid collisions
4. **Server configuration must include transport type** - either `stdio` or `sse` (Server-Sent Events)
5. **Resource URLs must be validated** - reject any URLs with local file access outside allowed paths

## Instructions

### Step 1: Verify MCP Service Structure Exists

Check that the following files exist:

- `src/services/mcp/client.ts` - MCP client implementation
- `src/services/mcp/config.ts` - Server configuration types
- `src/tools/MCPTool/` - Tool wrapper directory for MCP calls

```typescript
// Expected imports in src/services/mcp/client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
```

Verify the MCP SDK is installed:

```bash
bun pm ls | grep @modelcontextprotocol
```

### Step 2: Define Server Configuration

Add server configuration to `src/services/mcp/config.ts`:

```typescript
export interface McpServerConfig {
  name: string
  transport: 'stdio' | 'sse'
  command?: string // for stdio
  args?: string[] // for stdio
  url?: string // for sse
  env?: Record<string, string>
  disabled?: boolean
}
```

Validate config before proceeding:

- `name` must be unique across all servers
- `stdio` transport requires `command` and optionally `args`
- `sse` transport requires `url`

### Step 3: Implement Server Connection Logic

In `src/services/mcp/client.ts`, use this pattern:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import type { McpServerConfig } from './config.ts'

export async function connectServer(config: McpServerConfig): Promise<Client> {
  const transport =
    config.transport === 'stdio'
      ? new StdioClientTransport({
          command: config.command!,
          args: config.args ?? [],
          env: { ...process.env, ...config.env },
        })
      : // SSE transport handled separately
        await createSseTransport(config.url!)

  const client = new Client(
    { name: config.name, version: '1.0.0' },
    {
      capabilities: { tools: {}, resources: {} },
    }
  )

  await client.connect(transport)
  return client
}
```

Verify: Client connects without throwing before proceeding to Step 4.

### Step 4: Discover and Register Tools

List available tools from connected server:

```typescript
export async function discoverTools(client: Client): Promise<McpTool[]> {
  const response = await client.listTools()
  return response.tools.map((tool) => ({
    name: tool.name,
    description: tool.description ?? '',
    inputSchema: tool.inputSchema as Record<string, unknown>,
  }))
}
```

Register tools with namespaced names:

```typescript
// Namespaced tool name format
const namespacedName = `mcp__${serverName}__${toolName}`
```

### Step 5: Implement Tool Execution Wrapper

Create tool wrapper in `src/tools/MCPTool/` following the project's Tool pattern:

```typescript
import { Tool } from '../../Tool.ts'
import type { ToolCall, ToolResult } from '../../types.ts'

export class MCPTool extends Tool {
  prompt = 'Call tools from connected MCP servers'

  constants = {
    serverName: 'string',
    toolName: 'string',
    arguments: 'object',
    _hidden: 'Do not call directly. Use namespaced tool names.',
  }

  async call(params: ToolCall): Promise<ToolResult> {
    const { serverName, toolName, arguments: args } = params.params

    const client = await this.getMcpClient(serverName)
    if (!client) {
      return {
        error: `MCP server '${serverName}' not connected`,
        code: 503,
      }
    }

    try {
      const result = await client.callTool({
        name: toolName,
        arguments: args,
      })

      return {
        output: result.content,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown MCP error',
        code: 500,
      }
    }
  }
}
```

Validate tool execution returns proper `ToolResult` type.

### Step 6: Add Permission Patterns

Register permissions in `src/utils/permissions/` for MCP operations:

```typescript
// Add to permission patterns
{
  pattern: 'mcp:*',
  description: 'Allow all MCP server operations',
},
{
  pattern: 'mcp:connect',
  description: 'Allow connecting to MCP servers',
},
{
  pattern: `mcp:${serverName}:*`,
  description: `Allow all operations on MCP server ${serverName}`,
}
```

### Step 7: Handle Authentication (if required)

For authenticated MCP servers, add to `src/tools/McpAuthTool/`:

```typescript
export class McpAuthTool extends Tool {
  prompt = 'Authenticate with MCP servers requiring credentials'

  constants = {
    serverName: 'string',
    authType: 'string', // 'oauth' | 'api-key' | 'basic'
    credentials: 'object',
  }

  async call(params: ToolCall): Promise<ToolResult> {
    // OAuth flow or API key injection
    const { serverName, authType, credentials } = params.params
    // Implementation depends on auth type
  }
}
```

### Step 8: Register Server in Configuration Store

Add server to persistent config (typically JSON file or state):

```typescript
// In src/services/mcp/config.ts
export async function saveServerConfig(config: McpServerConfig): Promise<void> {
  // Write to ~/.claude-haha/mcp-servers.json or similar
  const configPath = path.join(os.homedir(), '.claude-haha', 'mcp-servers.json')
  const existing = await loadServerConfigs()
  existing.push(config)
  await fs.writeFile(configPath, JSON.stringify(existing, null, 2))
}
```

## Examples

**User says**: "Add MCP server for filesystem access"

**Actions taken**:

1. Create config in `src/services/mcp/config.ts`:

```typescript
const filesystemConfig: McpServerConfig = {
  name: 'filesystem',
  transport: 'stdio',
  command: 'npx',
  args: ['-y', '@anthropic-ai/mcp-server-filesystem', '/allowed/path'],
}
```

2. Call `connectServer(filesystemConfig)`
3. Discover tools: `read_file`, `write_file`, `list_directory`
4. Register as: `mcp__filesystem__read_file`, `mcp__filesystem__write_file`, etc.

**Result**: Tools `mcp__filesystem__read_file` etc. available in session.

## Common Issues

**Error: "Cannot find module '@modelcontextprotocol/sdk'"**

1. Install SDK: `bun add @modelcontextprotocol/sdk`
2. Verify: `bun pm ls | grep modelcontextprotocol`

**Error: "Transport error: spawn npx ENOENT"**

1. Verify Node.js/npm is installed: `which npx`
2. For Windows, use full path: `command: 'C:\Program Files\nodejs\npx.cmd'`
3. Alternative: use `bunx` instead of `npx`

**Error: "Tool 'xyz' not found in MCP server"**

1. List available tools: `await client.listTools()`
2. Check tool name matches exactly (case-sensitive)
3. Verify server supports the tools capability

**Error: "Permission denied for MCP operation"**

1. Check permission patterns in `src/utils/permissions/`
2. Add pattern: `{ pattern: 'mcp:serverName:toolName' }`
3. For interactive approval, use permission prompt component

**Error: "Connection refused to SSE endpoint"**

1. Verify URL is correct and server is running
2. Check CORS headers on server if different origin
3. Try with curl: `curl -v <url>/sse`

**Tool results showing "[Object object]" instead of content**

1. MCP returns `CallToolResult` with `content` array
2. Each content item has `type` ('text', 'image', 'resource')
3. Extract text: `result.content.filter(c => c.type === 'text').map(c => c.text).join('\n')`
