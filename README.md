# BlockVectra MCP server

Remote [Model Context Protocol](https://modelcontextprotocol.io) server for [BlockVectra](https://blockvectra.com/en/agents/?ref=gh-mcp): multi-chain EVM JSON-RPC, indexed Data API, docs, CU pricing and status. Documentation, discovery, pricing and status need no API key. Keyless RPC depends on each chain's public method policy; indexed Data API and account tools require your own BlockVectra API key.

[中文](README.zh.md)

## Documentation-only remote connection

For setup answers with source links, connect directly to `https://docs.blockvectra.com/mcp/docs` using Streamable HTTP. It exposes only `search_docs` and `read_doc`, needs no BlockVectra account or API key, and requires no local bridge or package installation.

For remote URL settings below, use this URL and a distinct server name such as `blockvectra-docs-only`. Packaged plugins and stdio commands keep their existing scopes. With ToolHive, keep `--target-uri` set to the origin and put `/mcp/docs` on the loopback client URL. Ask: "Find the Robinhood Chain setup guide, read it, and cite the source. Separate mainnet from testnet; do not run RPC or send a transaction."

The server enforces the two-tool scope, including when a key is supplied. For chain discovery, RPC, indexed data or account tools, use the full `https://docs.blockvectra.com/mcp` connection described below. Keep the two connections under separate names if you need both.

Registry version `2.0.0` of `com.blockvectra/docs` points to this two-tool documentation endpoint. Existing `1.x` registry versions describe the full `/mcp` endpoint; use `/mcp` directly when you need discovery, RPC or authenticated data tools.

## First documentation read with Python

With Python 3.11+ and [uv](https://docs.astral.sh/uv/), run the example directly from its fixed commit; no Git checkout is needed:

```bash
uv run --script https://raw.githubusercontent.com/blockvectra/agent-quickstart/07b2d89f0ab9129c011d8b135dec441c6bde1f04/examples/mcp_docs.py
```

To inspect or edit the example locally, use the [fixed-version Git checkout](https://github.com/blockvectra/agent-quickstart/releases/tag/python-mcp-docs-2026.11.06):

```bash
git clone --branch python-mcp-docs-2026.11.06 --depth 1 https://github.com/blockvectra/agent-quickstart.git
cd agent-quickstart
uv run examples/mcp_docs.py
```

uv installs the pinned `mcp==2.3.0` client dependency. The example connects to `/mcp/docs`, lists `search_docs` and `read_doc`, then reads the English `quickstart` page. It prints JSON with the tool names and full Markdown text. No BlockVectra account, API key, wallet or model API is needed; this task only reads documentation.

## Robinhood Chain mainnet and testnet tasks

Use the [chain RPC guide](https://docs.blockvectra.com/en/guides/robinhood-chain/) for mainnet public read-only RPC tasks. Use the [testnet starter](https://docs.blockvectra.com/en/guides/robinhood-testnet-starter/) and [faucet guide](https://docs.blockvectra.com/en/guides/robinhood-testnet-faucet/) for testnet tasks. Mainnet public reads do not require claiming testnet tokens first.

Connect to `https://docs.blockvectra.com/mcp` without headers for documentation and discovery. Robinhood Chain public endpoints allow supported RPC reads without a key; methods outside the public policy require an API key. Faucet claims require `x-api-key`. HTTP `202` means accepted; check the transaction receipt for on-chain inclusion (`status: "0x1"`), which is not finality.

For a first mainnet RPC check before configuring an MCP client, use the [fixed-version keyless TypeScript Quickstart](https://github.com/blockvectra/agent-quickstart/releases/tag/keyless-chain-id-2026.11.02). With Node.js 22 (>=22.18) or Node.js >=24.12, and Git, run:

```bash
git clone --branch keyless-chain-id-2026.11.02 --depth 1 https://github.com/blockvectra/agent-quickstart.git
cd agent-quickstart
node src/public-read-cli.ts
```

To read another chain, pass its decimal chain ID: `node src/public-read-cli.ts 56` for BNB Smart Chain, `1` for Ethereum mainnet, or `57073` for Ink. With no argument, the default is Robinhood mainnet (`4663`).

No dependency installation, wallet, account or API key is needed. The reader checks the chain directory, verifies the chain ID, then reads the latest block number: at most three HTTP requests, including two RPC calls. It stops before RPC if the directory does not advertise the required public endpoint and methods.

## Read HoodFi name records on Robinhood Chain

For an address stored under a HoodFi name, follow the [HoodFi name-record guide](https://docs.blockvectra.com/en/guides/hoodfi-name-records/?ref=gh-mcp-hoodfi). It selects Robinhood coin type `2147488311` and compares coin type `60` at the same canonical block hash. A missing or invalid Robinhood record stops the read; coin type 60 is not a fallback. If the records differ, confirm the Robinhood destination before using it.

With the documentation connection above, ask: "Find and read the HoodFi name-record guide. Explain how to select the Robinhood record, compare the two coin types at one block hash, and stop on errors. Cite the source; do not run RPC or send a transaction."

Reading the guide needs no key. Running its four-request diagnostic requires your own API key in the `x-api-key` header on the keyed RPC endpoint. Keep credentials out of prompts and tool arguments. The diagnostic reads records only; it does not send funds.

## Documentation Skill for coding agents

For source-linked setup answers, install the [blockvectra-docs Skill](https://github.com/blockvectra/agent-quickstart/tree/main/skills/blockvectra-docs) from your project directory with Node.js 22.20 or newer. Choose the command for your agent; these project-scoped commands skip installer prompts:

```bash
# Codex
npx --yes skills@1.7.4 add blockvectra/agent-quickstart --skill blockvectra-docs --agent codex --yes

# Claude Code
npx --yes skills@1.7.4 add blockvectra/agent-quickstart --skill blockvectra-docs --agent claude-code --yes
```

Try: "How do I get started on Robinhood Chain? Separate mainnet from testnet and cite the docs."

The Skill uses a configured BlockVectra MCP connection (`search_docs`, then `read_doc`) or your agent's HTTP reader to find and read Markdown pages. Documentation lookup needs no BlockVectra account or API key. Follow the MCP setup below to configure a server connection for RPC, indexed data and account tools.

## Install in one step

[![MCP connection checks](https://mcp.aianytime.net/badge/blockvectra.svg)](https://mcp.aianytime.net/s/blockvectra/)

Before connecting, you can check [AI Anytime's independent report](https://mcp.aianytime.net/s/blockvectra/) for the latest MCP initialization and tool-discovery results. These checks cover the MCP connection, not individual blockchain RPC calls.

Server URL (Streamable HTTP, no key needed): `https://docs.blockvectra.com/mcp`

| Client | One-line install | Source |
| --- | --- | --- |
| Claude Code | `claude mcp add --transport http blockvectra-docs https://docs.blockvectra.com/mcp` | [MCP in Claude Code](https://code.claude.com/docs/en/mcp) |
| Codex | `codex mcp add blockvectra --url https://docs.blockvectra.com/mcp` | [Codex MCP setup](https://developers.openai.com/learn/docs-mcp) |
| Claude Code plugin (MCP server + `blockvectra-rpc` skill) | `/plugin marketplace add blockvectra/mcp`, then `/plugin install blockvectra-docs@blockvectra` | [Create a marketplace](https://code.claude.com/docs/en/plugin-marketplaces), [Plugin dependencies](https://code.claude.com/docs/en/plugins/dependencies) |
| Cursor | [Add to Cursor](https://cursor.com/link/mcp/install?name=blockvectra-docs&config=eyJ1cmwiOiJodHRwczovL2RvY3MuYmxvY2t2ZWN0cmEuY29tL21jcCJ9) (web link), or open `cursor://anysphere.cursor-deeplink/mcp/install?name=blockvectra-docs&config=eyJ1cmwiOiJodHRwczovL2RvY3MuYmxvY2t2ZWN0cmEuY29tL21jcCJ9` | [MCP install links](https://cursor.com/docs/mcp/install-links), [web link form](https://cursor.com/docs/reference/deeplinks) |
| VS Code | `code --add-mcp '{"name":"blockvectra-docs","type":"http","url":"https://docs.blockvectra.com/mcp"}'` | [Use MCP servers in VS Code](https://code.visualstudio.com/docs/agent-customization/mcp-servers) |
| VS Code (link) | `vscode:mcp/install?%7B%22name%22%3A%22blockvectra-docs%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fdocs.blockvectra.com%2Fmcp%22%7D` | [MCP developer guide](https://code.visualstudio.com/api/extension-guides/ai/mcp) |
| Gemini CLI | `gemini extensions install https://github.com/blockvectra/mcp --ref main` | [Gemini CLI extensions](https://geminicli.com/docs/extensions/reference/) |
| Antigravity | [Project-local installation](#antigravity-plugin) | [Antigravity plugins](https://www.antigravity.google/docs/plugins?tab=cli) |
| OpenCode | [Project configuration](#opencode-opencodejson) | [OpenCode MCP servers](https://opencode.ai/v2/docs/mcp-servers/) |
| ToolHive | [Local HTTP proxy](#toolhive-local-http-proxy) | [ToolHive proxy reference](https://docs.stacklok.com/toolhive/reference/cli/thv_proxy) |

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

## Try a first chain read

With the keyless MCP connection above, give your agent this task:

> Call `list_chains` once and find Ink (chain ID 57073). Use its returned `chain` slug. Continue only if its `public.url` exists and `public.methods` includes both `eth_chainId` and `eth_blockNumber`. Call `rpc_call` with that chain, `method="eth_chainId"` and `params=[]`; decode the hexadecimal result and stop unless it equals 57073. Then call `rpc_call` with the same chain, `method="eth_blockNumber"` and `params=[]`. Show the chain ID, returned block number and UTC observation time. Stop on an error; do not retry, register, create a key or send a transaction.

This task uses at most three MCP tool calls, sequentially. It needs no wallet, account, API key, repository checkout or local Node.js. A successful read checks chain identity and obtains a block number; it does not verify historical coverage, indexing freshness or performance. If you connected the documentation-only stdio entry below, it exposes only `search_docs` and `read_doc`; use the full remote connection above for this task.

## Local stdio bridge

Use Node.js 22 or newer to run the MIT-licensed stdio bridge:

```bash
npx --yes --package @blockvectra/mcp@0.1.0 blockvectra-mcp
```

This uses the published npm release `0.1.0`. For documentation only, use the versioned GitHub package below.

Configure a stdio client:

```json
{
  "mcpServers": {
    "blockvectra-docs": {
      "command": "npx",
      "args": ["--yes", "--package", "@blockvectra/mcp@0.1.0", "blockvectra-mcp"]
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
npx --yes --package https://github.com/blockvectra/mcp/releases/download/v0.1.1/blockvectra-mcp-0.1.1.tgz blockvectra-docs-mcp
```

This installs the [GitHub 0.1.1 package](https://github.com/blockvectra/mcp/releases/tag/v0.1.1) and its dependencies; no BlockVectra account or key is needed. This package includes the documentation-only command; npm 0.1.0 does not. The GitHub package is available without waiting for an npm 0.1.1 publication. Verify a downloaded package against the release's [SHA256SUMS](https://github.com/blockvectra/mcp/releases/download/v0.1.1/SHA256SUMS) before installing it locally.

For clients that use an `mcpServers` configuration, select the documentation-only command explicitly:

```json
{
  "mcpServers": {
    "blockvectra-docs-only": {
      "command": "npx",
      "args": [
        "--yes",
        "--package",
        "https://github.com/blockvectra/mcp/releases/download/v0.1.1/blockvectra-mcp-0.1.1.tgz",
        "blockvectra-docs-mcp"
      ]
    }
  }
}
```

Restart the client and ask it to find the Robinhood Chain setup guide with `search_docs`, then read one returned document with `read_doc`.

For a source checkout, run `npm ci`, then use `node /absolute/path/to/blockvectra-mcp/src/docs-cli.js` instead. This entry lists only the two documentation tools and locally rejects other tool calls and non-documentation methods before forwarding. It does not forward `BLOCKVECTRA_API_KEY`, even if inherited. It also omits other server capabilities and does not expose reverse client requests such as sampling or roots.

The default `src/cli.js` entry remains the full bridge described above. `@blockvectra/mcp@0.1.0` does not include the documentation-only entry. This limits this MCP connection, not the host agent's other tools, shell or network access. Model or hosting charges are separate.

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

## ToolHive: local HTTP proxy

With [ToolHive CLI](https://docs.stacklok.com/toolhive/guides-cli/install) installed, start a foreground proxy:

```bash
thv proxy blockvectra-docs --target-uri https://docs.blockvectra.com \
  --host 127.0.0.1 --port 55840
```

Keep that terminal open. Add `http://127.0.0.1:55840/mcp` to your MCP client as a Streamable HTTP server, with no authentication headers. If the port is occupied, choose another unused port in both places. Stop the proxy with Ctrl+C when finished.

In ToolHive **0.62.0**, `--target-uri` must contain only the origin; adding `/mcp` there fails before connecting. The client URL includes `/mcp`, which the proxy forwards to the remote server. See the [versioned target validation](https://github.com/stacklok/toolhive/blob/v0.62.0/cmd/thv/app/proxy.go#L587-L590).

For a first check, ask your client to call `read_doc` with `{"path":"guides/mcp-server","lang":"en"}` and show the returned source link. This needs no BlockVectra account, wallet or API key. The proxy exposes the full remote tool catalog; the first check uses only documentation.

This route was tested on 2026-11-05 with ToolHive 0.62.0: initialize, tool discovery and one `read_doc` succeeded. It did not test blockchain RPC, indexed data or account tools. Model-provider setup and charges remain part of your MCP client.

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

The keyless Cursor configuration is in [`.mcp.json`](.mcp.json), referenced by the [Cursor plugin manifest](.cursor-plugin/plugin.json). For Cline's Streamable HTTP setup and optional `x-api-key` headers, follow [llms-install.md](llms-install.md). Terminal users can use the [Cline CLI install command and first documentation read](llms-install.md#cline-cli). Start without headers: call `list_chains`, then `read_doc` with `{"path":"quickstart","lang":"en"}`.

## Kilo CLI: project connection

Follow the [Kilo CLI setup](llms-install.md#kilo-cli) to add the hosted server to `kilo.json`, check its connection, and ask for a first documentation read. Kilo CLI uses `"type": "remote"`; no BlockVectra key is needed for documentation lookup.

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
claude mcp list
```

Check for `Connected` in the output. A [saved Claude Code 2.1.280 connection check](https://gist.github.com/gjwang/4ec1d04cdc5a1ed99c65ec334e0ca51a) includes the observed output and configuration scope.

For tools that require a key, set `BLOCKVECTRA_API_KEY` before starting Claude Code and use `"headers": {"x-api-key": "${BLOCKVECTRA_API_KEY}"}` in the server configuration. See [Claude Code's environment-variable expansion](https://code.claude.com/docs/en/mcp#environment-variable-expansion-in-mcpjson). Keep only the variable reference in the file; never pass the key as a CLI argument.

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

### OpenCode (`opencode.json`)

Check `opencode --version`, then merge the matching configuration into your project's `opencode.json`. Connecting and reading documentation need no BlockVectra account or key.

**OpenCode 2** puts server entries under `mcp.servers`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "blockvectra": {
        "type": "remote",
        "url": "https://docs.blockvectra.com/mcp",
        "oauth": false
      }
    }
  }
}
```

**OpenCode 1** puts them directly under `mcp`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "blockvectra": {
      "type": "remote",
      "url": "https://docs.blockvectra.com/mcp",
      "oauth": false
    }
  }
}
```

Run `opencode mcp list` from that project and check that `blockvectra` is connected. For a first task, ask OpenCode to find and read the Robinhood Chain mainnet setup guide with `search_docs` and `read_doc`, then cite the page. This task needs no RPC or transaction.

For tools that require a key, set `BLOCKVECTRA_API_KEY` in your local environment and add `"headers": {"x-api-key": "{env:BLOCKVECTRA_API_KEY}"}` inside the `blockvectra` server object. Keep the key out of the file and chat; shell syntax such as `$BLOCKVECTRA_API_KEY` is not substituted in this JSON. See the [v2 MCP guide](https://opencode.ai/v2/docs/mcp-servers/) or [v1 MCP guide](https://docs.opencode.ai/docs/mcp-servers/) for your version.

## Registry

`server.json` describes this server for the [official MCP Registry](https://registry.modelcontextprotocol.io) under the name `com.blockvectra/docs`. Publishing is a manual workflow (`.github/workflows/publish.yml`).

## License

[MIT](LICENSE)
