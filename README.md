# BlockVectra MCP server

Remote [Model Context Protocol](https://modelcontextprotocol.io) server for [BlockVectra](https://blockvectra.com/en/agents/?ref=gh-mcp): keyless multi-chain EVM JSON-RPC, the indexed Data API, documentation, pricing and status, for AI agents.

[中文](README.zh.md)

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
# with an API key
claude mcp add --transport http blockvectra https://docs.blockvectra.com/mcp --header "x-api-key: $BLOCKVECTRA_API_KEY"
```

### Cursor (`mcp.json`)

```json
{
  "mcpServers": {
    "blockvectra": {
      "url": "https://docs.blockvectra.com/mcp"
    }
  }
}
```

### VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "blockvectra": {
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
