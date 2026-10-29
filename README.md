# BlockVectra MCP server

Remote [Model Context Protocol](https://modelcontextprotocol.io) server for [BlockVectra](https://blockvectra.com/en/agents/?ref=gh-mcp): multi-chain EVM JSON-RPC, indexed Data API, docs, CU pricing and status. Documentation, discovery, pricing and status need no API key. Keyless RPC depends on each chain's public method policy; indexed Data API and account tools require your own BlockVectra API key.

[中文](README.zh.md)

## Robinhood Chain mainnet and testnet tasks

Use the [chain RPC guide](https://docs.blockvectra.com/en/guides/robinhood-chain/) for mainnet public read-only RPC tasks. Use the [testnet starter](https://docs.blockvectra.com/en/guides/robinhood-testnet-starter/) and [faucet guide](https://docs.blockvectra.com/en/guides/robinhood-testnet-faucet/) for testnet tasks. Mainnet public reads do not require claiming testnet tokens first.

Connect to `https://docs.blockvectra.com/mcp` without headers for documentation and discovery. Robinhood Chain public endpoints allow supported RPC reads without a key; methods outside the public policy require an API key. Faucet claims require `x-api-key`. HTTP `202` means accepted; check the transaction receipt for on-chain inclusion (`status: "0x1"`), which is not finality.

## Local stdio bridge

Use Node.js 22 or newer to run the MIT-licensed stdio bridge:

```bash
npx --yes --package @blockvectra/mcp@0.1.1 blockvectra-mcp
```

The `mcp` executable is also an alias for the full bridge, preserving bare `npx @blockvectra/mcp` calls. For documentation only, use the separate command below.

Configure a stdio client:

```json
{
  "mcpServers": {
    "blockvectra-docs": {
      "command": "npx",
      "args": ["--yes", "--package", "@blockvectra/mcp@0.1.1", "blockvectra-mcp"]
    }
  }
}
```

For a source checkout, run `npm ci`, then use `node` with the absolute path to `src/cli.js` instead.

The CLI always bridges to `https://docs.blockvectra.com/mcp`; it accepts no command-line arguments. Optionally supply `BLOCKVECTRA_API_KEY` through the child process environment or your client's private environment settings. It is forwarded only as `x-api-key`. Never put a key in CLI arguments, tool arguments, or chat; never supply private keys.

The default entry connects the official `StreamableHTTPClientTransport` and `StdioServerTransport` directly, without rebuilding capabilities or tools. It preserves initialize parameters/results, capabilities, instructions, protocolVersion, tool results, JSON-RPC errors, notifications and bidirectional requests at the JSON message level (not byte formatting). After a successful initialize response, it sets the HTTP transport's negotiated protocol version before forwarding that response. stdout contains MCP messages only; stderr uses fixed diagnostics without SDK error text. EOF, SIGINT and SIGTERM close both transports; transport failures close the bridge with exit code 1. HTTP/SSE behavior, parsing and reconnection remain SDK behavior.

Dependencies are pinned to official `@modelcontextprotocol/client` and `@modelcontextprotocol/server` **2.3.1**, whose published package exports and source provide these transports and require Node >=20. See the [official SDK repository/releases](https://github.com/modelcontextprotocol/typescript-sdk/releases) and [connection documentation](https://ts.sdk.modelcontextprotocol.io/v2/clients/connect). As of 2026-10-13, [Node's official release table](https://nodejs.org/en/about/previous-releases) lists Node 20 as EOL and Node 22 as LTS, so this package requires **Node >=22**.

Local verification: `npm test` runs only the serial mock HTTP/real stdio subprocess tests; `npm pack --dry-run` checks the package contents. No build is required.

## Documentation-only stdio

For a setup helper that needs just `search_docs` and `read_doc`, use Node.js 22+:

```bash
npx --yes --package @blockvectra/mcp@0.1.1 blockvectra-docs-mcp
```

This installs the package and its dependencies; no BlockVectra account or key is needed. To use the fixed source snapshot instead, run `npx --yes --package https://github.com/blockvectra/mcp/archive/e39ef37e45fb16d3dc33a225d4139be1220deba5.tar.gz blockvectra-docs-mcp`.

For clients that use an `mcpServers` configuration, select the documentation-only command explicitly:

```json
{
  "mcpServers": {
    "blockvectra-docs-only": {
      "command": "npx",
      "args": [
        "--yes",
        "--package",
        "@blockvectra/mcp@0.1.1",
        "blockvectra-docs-mcp"
      ]
    }
  }
}
```

Restart the client and ask it to find the Robinhood Chain setup guide with `search_docs`, then read one returned document with `read_doc`.

For a source checkout, run `npm ci`, then use `node /absolute/path/to/blockvectra-mcp/src/docs-cli.js` instead. This entry lists only the two documentation tools and locally rejects other tool calls and non-documentation methods before forwarding. It does not forward `BLOCKVECTRA_API_KEY`, even if inherited. It also omits other server capabilities and does not expose reverse client requests such as sampling or roots.

The default `src/cli.js` entry remains the full bridge described above. `@blockvectra/mcp@0.1.0` does not include the documentation-only entry. This limits this MCP connection, not the host agent's other tools, shell or network access. Model or hosting charges are separate.

## Install in one step

Server URL (Streamable HTTP, no key needed): `https://docs.blockvectra.com/mcp`

| Client | One-line install | Source |
| --- | --- | --- |
| Claude Code | `claude mcp add --transport http blockvectra-docs https://docs.blockvectra.com/mcp` | [MCP in Claude Code](https://code.claude.com/docs/en/mcp) |
| Claude Code plugin (MCP server + `blockvectra-rpc` skill) | `/plugin marketplace add blockvectra/mcp`, then `/plugin install blockvectra-docs@blockvectra` | [Create a marketplace](https://code.claude.com/docs/en/plugin-marketplaces), [Plugin dependencies](https://code.claude.com/docs/en/plugins/dependencies) |
| Cursor | [Add to Cursor](https://cursor.com/link/mcp/install?name=blockvectra-docs&config=eyJ1cmwiOiJodHRwczovL2RvY3MuYmxvY2t2ZWN0cmEuY29tL21jcCJ9) (web link), or open `cursor://anysphere.cursor-deeplink/mcp/install?name=blockvectra-docs&config=eyJ1cmwiOiJodHRwczovL2RvY3MuYmxvY2t2ZWN0cmEuY29tL21jcCJ9` | [MCP install links](https://cursor.com/docs/mcp/install-links), [web link form](https://cursor.com/docs/reference/deeplinks) |
| VS Code | `code --add-mcp '{"name":"blockvectra-docs","type":"http","url":"https://docs.blockvectra.com/mcp"}'` | [Use MCP servers in VS Code](https://code.visualstudio.com/docs/agent-customization/mcp-servers) |
| VS Code (link) | `vscode:mcp/install?%7B%22name%22%3A%22blockvectra-docs%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fdocs.blockvectra.com%2Fmcp%22%7D` | [MCP developer guide](https://code.visualstudio.com/api/extension-guides/ai/mcp) |
| Gemini CLI | `gemini extensions install https://github.com/blockvectra/mcp --ref main` | [Gemini CLI extensions](https://geminicli.com/docs/extensions/reference/) |
| Antigravity | `agy plugin install https://github.com/blockvectra/mcp` | [Antigravity plugins](https://www.antigravity.google/docs/plugins?tab=cli) |

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

## goose: keyless documentation lookup

Use [goose](https://goose-docs.ai/) with your configured model provider. The documentation tools need no BlockVectra account or API key.

Download and run the [documentation recipe](recipes/goose-docs.json). You only need this JSON file, not a checkout of the repository:

```bash
curl --fail --location --output blockvectra-goose-docs.json \
  https://raw.githubusercontent.com/blockvectra/mcp/8c99c0e499166d8ba2163536f8d150571783c0a3/recipes/goose-docs.json
goose recipe validate blockvectra-goose-docs.json
goose run --recipe blockvectra-goose-docs.json
```

It asks `search_docs` for Robinhood Chain mainnet setup, then reads one returned document with `read_doc`. The recipe lists only those two tools; it does not include RPC, account or transaction tools. A successful result should cite the document and explain which connection steps need a key. The model uses your goose provider's normal quota or billing.

For an interactive session instead, add the remote extension for that session:

```bash
goose session --with-streamable-http-extension "https://docs.blockvectra.com/mcp"
```

That session discovers the full tool catalog; the recipe is the smaller documentation-only starting point. See the [goose extension guide](https://goose-docs.ai/docs/getting-started/using-extensions/) and [recipe reference](https://goose-docs.ai/docs/guides/recipes/recipe-reference/).

## Portable RPC documentation agent

For a small hosted-agent demonstration, use the [portable instructions and evaluation cases](recipes/rpc-docs-agent/README.md). They reuse the two-tool documentation task above. This is a prompt and demo brief, not a Lagrange manifest or a verified deployment; host tool filtering and model/hosting charges are separate.

## n8n: offline proposal check

For a regular n8n MCP Client workflow, [this recipe](recipes/n8n-zero-budget.md) shows how to check a proposed `rpc_call` offline before any MCP node runs. Paste [the Code node](recipes/n8n-zero-budget-code.txt) and compare it against the [fixtures](recipes/n8n-zero-budget-fixtures.json). With the trusted budgets set to zero, every receipt is an advisory comparison and dispatch is always `DENY`. It is not funding authorization or execution, and it has not been run in a real n8n instance. Read the guide for setup and limits.

## Gemini CLI extension

The extension connects to `https://docs.blockvectra.com/mcp` directly over remote Streamable HTTP. You do not need the local stdio bridge or npm.

After installing, restart Gemini CLI and run `/mcp` to inspect the available tools. Try `list_chains`, then call `read_doc` with `path=quickstart` and `lang=en`.

### Optional authentication

The extension is keyless by default: documentation, discovery, pricing and status stay keyless; RPC follows each chain's public method policy; indexed data and account tools need your own BlockVectra API key. Never put a key in argv, tool arguments, chat or version control, and do not export a literal key into shell history. Make `BLOCKVECTRA_API_KEY` available in Gemini's process environment before launch, using your existing private secret manager or private launch environment; a `.gemini/.env` file alone is not sufficient.

To send the key as a header, merge this into your user `~/.gemini/settings.json` without replacing other settings:

```json
{
  "mcpServers": {
    "blockvectra-docs": {
      "httpUrl": "https://docs.blockvectra.com/mcp",
      "headers": { "x-api-key": "${BLOCKVECTRA_API_KEY}" }
    }
  }
}
```

This user-scope entry overrides the extension's server of the same name. Restart Gemini CLI after configuring it. `gemini mcp list` or `/mcp` only checks connectivity, not successful account or data authorization; to verify authentication, intentionally call the read-only `get_account` tool and keep the returned account data private.

Tested with official Gemini CLI 0.65.0 against a local mock with a synthetic key; this verifies client configuration and header transmission, not live keyed tool behavior. See [Gemini CLI MCP custom headers](https://geminicli.com/docs/tools/mcp-server/#http-based-mcp-server-with-custom-headers).

## Antigravity plugin

The plugin connects to `https://docs.blockvectra.com/mcp` directly over remote Streamable HTTP. You do not need the local stdio bridge or npm.

### Install in the current project

Run these commands from your project root:

```bash
mkdir -p .agents/plugins/blockvectra-docs
curl --fail --location https://raw.githubusercontent.com/blockvectra/mcp/antigravity-v0.1.0/plugin.json --output .agents/plugins/blockvectra-docs/plugin.json
curl --fail --location https://raw.githubusercontent.com/blockvectra/mcp/antigravity-v0.1.0/mcp_config.json --output .agents/plugins/blockvectra-docs/mcp_config.json
```

Start `agy` in that directory. For a first check, ask it to call `search_docs` with `{"query":"Antigravity","lang":"en","limit":1}`. Project-local loading and this single keyless documentation search were verified with Antigravity CLI 1.4.7.

The [official plugin guide](https://www.antigravity.google/docs/plugins/) describes project-local and global installation. The commands above place the plugin in this project's `.agents/plugins/` directory.

### After installation

After installing, restart Antigravity and run `/mcp` to inspect the available tools. Try `list_chains`, then call `read_doc` with `path=quickstart` and `lang=en`.

The plugin is keyless by default: documentation, discovery, pricing and status stay keyless; RPC follows each chain's public method policy; indexed data and account tools need your own BlockVectra API key. Never put a key in tool arguments, chat or version control. To send a key, configure it as a private header in your client, following [MCP in Antigravity](https://www.antigravity.google/docs/mcp/) and your client's private header settings.

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

### Cursor (`.cursor/mcp.json`)

Merge this server into your project’s `.cursor/mcp.json`, preserving any existing servers:

```json
{
  "mcpServers": {
    "blockvectra-docs": {
      "url": "https://docs.blockvectra.com/mcp"
    }
  }
}
```

For Cursor CLI, run these commands from that project directory to approve the connection and list its tools:

```bash
agent mcp enable blockvectra-docs
agent mcp list-tools blockvectra-docs
```

See [Cursor CLI MCP commands](https://cursor.com/docs/cli/mcp).


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
