# BlockVectra MCP server

Remote [Model Context Protocol](https://modelcontextprotocol.io) server for [BlockVectra](https://blockvectra.com/en/agents/?ref=gh-mcp): multi-chain EVM JSON-RPC, indexed Data API, docs, CU pricing and status. Documentation, discovery, pricing and status need no API key. Keyless RPC depends on each chain's public method policy; indexed Data API and account tools require your own BlockVectra API key.

[中文](README.zh.md)

## Robinhood Chain mainnet and testnet tasks

Use the [chain RPC guide](https://docs.blockvectra.com/en/guides/robinhood-chain/) for mainnet public read-only RPC tasks. Use the [testnet starter](https://docs.blockvectra.com/en/guides/robinhood-testnet-starter/) and [faucet guide](https://docs.blockvectra.com/en/guides/robinhood-testnet-faucet/) for testnet tasks. Mainnet public reads do not require claiming testnet tokens first.

Connect to `https://docs.blockvectra.com/mcp` without headers for documentation and discovery. Robinhood Chain public endpoints allow supported RPC reads without a key; methods outside the public policy require an API key. Faucet claims require `x-api-key`. HTTP `202` means accepted; check the transaction receipt for on-chain inclusion (`status: "0x1"`), which is not finality.

## Local stdio bridge

Use Node.js 22 or newer to run the MIT-licensed stdio bridge:

```bash
npx --yes @blockvectra/mcp@0.1.1
```

Configure a stdio client:

```json
{
  "mcpServers": {
    "blockvectra-docs": {
      "command": "npx",
      "args": ["--yes", "@blockvectra/mcp@0.1.1"]
    }
  }
}
```

For a source checkout, run `npm ci`, then use `node` with the absolute path to `src/cli.js` instead.

The CLI always bridges to `https://docs.blockvectra.com/mcp`; it accepts no command-line arguments. Optionally supply `BLOCKVECTRA_API_KEY` through the child process environment or your client's private environment settings. It is forwarded only as `x-api-key`. Never put a key in CLI arguments, tool arguments, or chat; never supply private keys.

The bridge connects the official `StreamableHTTPClientTransport` and `StdioServerTransport` directly, without rebuilding capabilities or tools. It preserves initialize parameters/results, capabilities, instructions, protocolVersion, tool results, JSON-RPC errors, notifications and bidirectional requests at the JSON message level (not byte formatting). After a successful initialize response, it sets the HTTP transport's negotiated protocol version before forwarding that response. stdout contains MCP messages only; stderr uses fixed diagnostics without SDK error text. EOF, SIGINT and SIGTERM close both transports; transport failures close the bridge with exit code 1. HTTP/SSE behavior, parsing and reconnection remain SDK behavior.

Dependencies are pinned to official `@modelcontextprotocol/client` and `@modelcontextprotocol/server` **2.3.1**, whose published package exports and source provide these transports and require Node >=20. See the [official SDK repository/releases](https://github.com/modelcontextprotocol/typescript-sdk/releases) and [connection documentation](https://ts.sdk.modelcontextprotocol.io/v2/clients/connect). As of 2026-10-13, [Node's official release table](https://nodejs.org/en/about/previous-releases) lists Node 20 as EOL and Node 22 as LTS, so this package requires **Node >=22**.

Local verification: `npm test` runs only the serial mock HTTP/real stdio subprocess tests; `npm pack --dry-run` checks the package contents. No build is required.

## Install in one step

Server URL (Streamable HTTP, no key needed): `https://docs.blockvectra.com/mcp`

| Client | One-line install | Source |
| --- | --- | --- |
| Claude Code | `claude mcp add --transport http blockvectra-docs https://docs.blockvectra.com/mcp` | [MCP in Claude Code](https://code.claude.com/docs/en/mcp) |
| Claude Code plugin (MCP server + `blockvectra-rpc` skill) | `/plugin marketplace add blockvectra/mcp`, then `/plugin install blockvectra-docs@blockvectra` | [Create a marketplace](https://code.claude.com/docs/en/plugin-marketplaces), [Plugin dependencies](https://code.claude.com/docs/en/plugins/dependencies) |
| Cursor | [Add to Cursor](https://cursor.com/link/mcp/install?name=blockvectra-docs&config=eyJ1cmwiOiJodHRwczovL2RvY3MuYmxvY2t2ZWN0cmEuY29tL21jcCJ9) (web link), or open `cursor://anysphere.cursor-deeplink/mcp/install?name=blockvectra-docs&config=eyJ1cmwiOiJodHRwczovL2RvY3MuYmxvY2t2ZWN0cmEuY29tL21jcCJ9` | [MCP install links](https://cursor.com/docs/mcp/install-links), [web link form](https://cursor.com/docs/reference/deeplinks) |
| VS Code | `code --add-mcp '{"name":"blockvectra-docs","type":"http","url":"https://docs.blockvectra.com/mcp"}'` | [Use MCP servers in VS Code](https://code.visualstudio.com/docs/agent-customization/mcp-servers) |
| VS Code (link) | `vscode:mcp/install?%7B%22name%22%3A%22blockvectra-docs%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fdocs.blockvectra.com%2Fmcp%22%7D` | [MCP developer guide](https://code.visualstudio.com/api/extension-guides/ai/mcp) |

The Cursor `config` value is the base64 of `{"url":"https://docs.blockvectra.com/mcp"}`. The VS Code link is the URL-encoded JSON server configuration.

The plugin is described by [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) and [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json). It installs the `blockvectra` MCP server from [`.mcp.json`](.mcp.json) and, as a dependency, the `blockvectra-rpc` skill from [blockvectra/skills](https://github.com/blockvectra/skills).

- **Endpoint:** `https://docs.blockvectra.com/mcp` (Streamable HTTP, stateless)
- **Auth:** optional `x-api-key` header (a BlockVectra API key). `Authorization: Bearer <key>` is also accepted. Without a key you can use the documentation, chain, pricing and status tools, and the JSON-RPC methods that a chain's public endpoint allows.
- **Never** put API keys or private keys in tool arguments or chat; the server reads the key only from HTTP headers.

Chains, prices and limits change, so this README does not list them. Read them live:

- Supported chains: `GET https://api.blockvectra.com/v1/chains`
- Plans, prices and limits: `GET https://console-api.blockvectra.com/v1/plans`
- Service status: `GET https://api.blockvectra.com/v1/status`

More: [BlockVectra for agents](https://blockvectra.com/en/agents/?ref=gh-mcp) and [AI agents guide](https://docs.blockvectra.com/en/guides/ai-agents/?ref=gh-mcp).

## Tools

This table reflects the server currently live at `https://docs.blockvectra.com/mcp`. Call `tools/list` for the authoritative list.

| Tool | What it does | API key | Read / write |
| --- | --- | --- | --- |
| `read_doc` | Read the raw Markdown of a documentation page | not needed | read-only |
| `search_docs` | Keyword search over documentation titles, paths and summaries | not needed | read-only |
| `list_docs` | List all documentation pages | not needed | read-only |
| `list_chains` | Supported chains, static parameters and method policy (`GET /v1/chains`) | not needed | read-only |
| `get_status` | Live service and network status (`GET /v1/status`) | not needed | read-only |
| `get_pricing` | Plans, CU weights and limits (`GET /v1/plans`) | not needed | read-only |
| `estimate_usage` | Estimate CU and USD cost for methods and daily call volumes | not needed | read-only |
| `get_method_info` | Per-chain availability, CU weight and price of a JSON-RPC method | not needed | read-only |
| `explain_error` | Look up an error code or reason: billing, retryability, recommended action | not needed | read-only |
| `how_to_get_api_key` | Steps to get an API key (programmatic SIWE sign-up or browser handoff) and the auth header formats | not needed | read-only |
| `rpc_call` | Execute a read-only JSON-RPC 2.0 method on a chain | optional: without a key only the chain's keyless public endpoint is used, where available | read-only |
| `data_api_get` | Query the Data API for a chain and path | required | read-only |
| `get_account` | Balance, CU and rate limits of your API key (`GET /v1/account`) | required | read-only |
| `get_deposit_address` | Your account's on-chain deposit address and open networks | required | read-only |
| `send_raw_transaction` | Broadcast an already signed raw transaction on a chain | optional: keyless access depends on the chain's public method policy | write (`destructiveHint: true`) |

Note: `get_deposit_address` and the other keyed tools return an error that points to `how_to_get_api_key` when called without a key.

## Use in Cursor / Cline

The keyless Cursor configuration is in [`.mcp.json`](.mcp.json), referenced by the [Cursor plugin manifest](.cursor-plugin/plugin.json). For Cline's Streamable HTTP setup and optional `x-api-key` headers, follow [llms-install.md](llms-install.md). Start without headers: call `list_chains`, then `read_doc` with `{"path":"quickstart","lang":"en"}`.

## Connect a client

Each snippet below follows the client's own documentation. Add the optional key header as that documentation describes for custom headers.

| Client | Official documentation |
| --- | --- |
| Claude Code | [MCP in Claude Code](https://code.claude.com/docs/en/mcp) |
| Cursor | [Model Context Protocol in Cursor](https://cursor.com/docs/context/mcp) |
| VS Code | [Use MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) |
| Codex | [Codex MCP](https://developers.openai.com/codex/mcp) |

### Claude Code

```bash
claude mcp add --transport http blockvectra https://docs.blockvectra.com/mcp
# For an optional key, use private environment-backed header settings;
# see the Codex env_http_headers example below. Never pass a key as a CLI argument.
```

### Cursor (`mcp.json`)

```json
{
  "mcpServers": {
    "blockvectra-docs": {
      "url": "https://docs.blockvectra.com/mcp"
    }
  }
}
```

### VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "blockvectra-docs": {
      "type": "http",
      "url": "https://docs.blockvectra.com/mcp"
    }
  }
}
```

### Codex (`~/.codex/config.toml`)

```toml
[mcp_servers.blockvectra]
url = "https://docs.blockvectra.com/mcp"
# optional: read the key from an environment variable
env_http_headers = { "x-api-key" = "BLOCKVECTRA_API_KEY" }
```

## Registry

`server.json` describes this server for the [official MCP Registry](https://registry.modelcontextprotocol.io) under the name `com.blockvectra/docs`. Publishing is a manual workflow (`.github/workflows/publish.yml`).

## License

[MIT](LICENSE)
