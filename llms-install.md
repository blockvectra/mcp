# Install BlockVectra in Cline and other MCP clients

Connect to `https://docs.blockvectra.com/mcp` using **Streamable HTTP**. The server is hosted remotely; no local server process is needed.

## Choose the connection scope

For documentation only, use `https://docs.blockvectra.com/mcp/docs` with Streamable HTTP and a distinct name such as `blockvectra-docs-only`. The server exposes only `search_docs` and `read_doc`; no BlockVectra account, API key, local bridge or package installation is needed. Supplying a key does not expand that scope.

The instructions below configure the full `/mcp` connection. For a documentation-only remote connection, substitute the `/mcp/docs` URL and the distinct server name in your client's remote settings. Verify it with `read_doc({"path":"guides/mcp-server","lang":"en"})`; skip the chain-discovery and API-key steps. With ToolHive, keep `--target-uri` set to the origin and put `/mcp/docs` on the loopback client URL. Local stdio commands and packaged plugins below keep their existing scopes.

Use the full `https://docs.blockvectra.com/mcp` connection for chain discovery, RPC, indexed data or account tools. Keep separate names if you configure both.

## Gemini CLI documentation connection

From a trusted project directory, add the two-tool documentation connection:

```bash
gemini mcp add --transport http --scope project blockvectra-docs-only https://docs.blockvectra.com/mcp/docs
```

This writes the connection to the project's `.gemini/settings.json`. Configure your model provider separately, then use `search_docs` and `read_doc` for source-linked setup answers. See [Gemini CLI MCP setup](https://geminicli.com/docs/tools/mcp-server/#adding-a-server-gemini-mcp-add).

## Pydantic AI

For a Pydantic AI project, run the [fixed-version example](https://github.com/blockvectra/agent-quickstart/blob/1f14f9ec159ed5f3d417876167cdb37e13579c8d/examples/pydantic_docs.py) with Python 3.11+ and uv, without cloning:

```bash
uv run --no-project --script --python 3.11 https://raw.githubusercontent.com/blockvectra/agent-quickstart/1f14f9ec159ed5f3d417876167cdb37e13579c8d/examples/pydantic_docs.py
```

It uses `MCPToolset` with pinned `pydantic-ai-slim[mcp]==2.66.0`, `fastmcp==4.1.6` and `mcp==2.3.0` to search for `quickstart` and read that English page. It prints the Markdown in JSON and needs no model, BlockVectra account, wallet or API key. The toolset closes on success or failure. See the [example's setup and timeout details](https://github.com/blockvectra/agent-quickstart/blob/1f14f9ec159ed5f3d417876167cdb37e13579c8d/README.md#read-documentation-with-pydantic-ai). This is a direct documentation-tool read, not a model-driven agent run.

## Cline

1. Open **MCP Servers** in Cline, then the **Remote Servers** tab.
2. Enter `blockvectra` as the server name and `https://docs.blockvectra.com/mcp` as the URL.
3. Select **Streamable HTTP**, leave headers empty, and click **Add Server**.
4. Confirm the server is enabled and its tools appear.

Alternatively, open **Configure → Configure MCP Servers** and merge this entry into the existing `mcpServers` object:

```json
{
  "mcpServers": {
    "blockvectra-docs": {
      "type": "streamableHttp",
      "url": "https://docs.blockvectra.com/mcp"
    }
  }
}
```

Cline requires `"type": "streamableHttp"`; omitting it selects legacy SSE. See the [official Cline MCP instructions](https://github.com/cline/cline/blob/main/docs/mcp/mcp-overview.mdx).

## Cline CLI

For Cline CLI **3.0.74**, add the remote server from your terminal:

```sh
cline mcp add blockvectra-docs https://docs.blockvectra.com/mcp --transport streamableHttp --yes --json
```

This saves the server in the CLI's MCP settings. Start a new Cline session after adding it, then ask:

> Call the `blockvectra-docs` server's `read_doc` tool with `{"path":"guides/mcp-server","lang":"en"}` and show the returned source link.

No BlockVectra API key is needed for this read. Configure your model provider in Cline first; its model usage is billed by that provider. See the [official CLI guide](https://github.com/cline/cline/tree/main/apps/cli#readme).

## Kilo CLI

For Kilo CLI **7.8.18**, merge this entry into your project's `kilo.json`. Keep any existing settings and other MCP servers:

```json
{
  "$schema": "https://app.kilo.ai/config.json",
  "mcp": {
    "blockvectra": {
      "type": "remote",
      "url": "https://docs.blockvectra.com/mcp",
      "enabled": true,
      "oauth": false,
      "timeout": 15000
    }
  }
}
```

Run `kilo mcp list` from that project and check that `blockvectra` is connected. Kilo uses `mcp` and `"type": "remote"` here; the marketplace's `"type": "streamable-http"` entry is not the CLI config format.

With your model provider configured in Kilo, start `kilo` in the project and ask:

> Call the `blockvectra` server's `read_doc` tool with `{"path":"guides/mcp-server","lang":"en"}` and show the returned source link.

This documentation task needs no BlockVectra account, wallet or API key. `kilo mcp list` checks the connection without calling a model; the documentation task uses the model provider you configure in Kilo. For config paths and private header configuration, see the [official Kilo MCP guide](https://kilo.ai/docs/automate/mcp/using-in-cli).

## goose

With goose installed and your model provider configured, start a documentation-only session without downloading a recipe or installing a local bridge:

```bash
goose session --with-streamable-http-extension "https://docs.blockvectra.com/mcp/docs"
```

Ask goose to find the Robinhood Chain setup guide, read one returned page, and cite the source. This endpoint exposes only `search_docs` and `read_doc`; it needs no BlockVectra account or API key. Model usage follows your goose provider's quota or billing.

For chain discovery, RPC, indexed data or account tools, substitute `https://docs.blockvectra.com/mcp`; those tools retain their own authentication and public-method policies. See the [goose setup and optional recipe](README.md#goose-keyless-documentation-lookup) and the [official Streamable HTTP command](https://github.com/aaif-goose/goose/blob/4facf56cbab049142809d9afa4648ebe6823ba80/documentation/docs/getting-started/using-extensions.md#remote-extensions-over-streamable-http).

## OpenCode

Check `opencode --version`, then follow the [versioned OpenCode configuration](README.md#opencode-opencodejson). OpenCode 1 and 2 use different configuration layouts; keep your existing settings and servers.

The guide includes the connection check and a first documentation task. Documentation needs no BlockVectra account or API key; model usage follows your configured model provider's billing.

## Cursor and other agent clients

For Cursor, merge the server definition from [`.mcp.json`](.mcp.json) into `.cursor/mcp.json` in your project or `~/.cursor/mcp.json` for global use. This repository also includes a [Cursor plugin manifest](.cursor-plugin/plugin.json) referencing that file. See [Cursor's MCP documentation](https://cursor.com/docs/context/mcp).

For other clients, add the same endpoint using their Streamable HTTP transport and leave authentication headers empty for the first connection. Transport field names vary by client; the Cline `type` value is specific to Cline.

## ToolHive

Use the [ToolHive proxy instructions](README.md#toolhive-local-http-proxy). In ToolHive 0.62.0, set the proxy target to the origin `https://docs.blockvectra.com`, and connect your MCP client to `http://127.0.0.1:55840/mcp`. Putting `/mcp` in `--target-uri` is rejected by that version. No BlockVectra key is needed for the documentation check.

## Local stdio clients

For a client that uses a local stdio command, install Node.js 22 or newer and use the published bridge:

```json
{
  "mcpServers": {
    "blockvectra-docs": {
      "command": "npx",
      "args": ["--yes", "@blockvectra/mcp@0.1.0"]
    }
  }
}
```

The command connects to the same hosted endpoint; it does not run a local blockchain node. Documentation and discovery need no key. For keyed tools, set `BLOCKVECTRA_API_KEY` in the child process environment or your client's private environment settings. The bridge forwards it as `x-api-key`; keep the value out of command-line arguments, tool arguments, and chat.

## Verify the keyless connection

Ask the agent to perform these calls in order:

1. Call `list_chains` with `{}` to discover the current supported chains and method policies.
2. Call `read_doc` with `{"path":"quickstart","lang":"en"}` to read the quickstart.

Neither call needs an API key. Confirm both return content without a tool error before proceeding.

## Add an API key when needed

`data_api_get`, `get_account`, and `get_deposit_address` require authentication. Obtain a BlockVectra API key via `how_to_get_api_key` or the [console](https://console.blockvectra.com/), then add `x-api-key` to this server's HTTP request headers in your private client settings.

For example, the Cline entry becomes:

```json
{
  "mcpServers": {
    "blockvectra-docs": {
      "type": "streamableHttp",
      "url": "https://docs.blockvectra.com/mcp",
      "headers": {
        "x-api-key": "YOUR_API_KEY"
      }
    }
  }
}
```

Replace `YOUR_API_KEY` locally with your actual key. For Cursor, add the same `headers` object to its server entry. Keep credentials out of repository files, tool arguments, and chat.

`rpc_call` executes read-only JSON-RPC methods; keyless access depends on each chain's public method policy. Signed transaction broadcast uses the separate `send_raw_transaction` tool.

Authentication and tool behavior are documented in the [BlockVectra AI agents guide](https://docs.blockvectra.com/en/guides/ai-agents/). Query the endpoint's `tools/list` for current tool schemas:

```bash
curl -sS --json '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
  -H 'Accept: application/json,text/event-stream' \
  https://docs.blockvectra.com/mcp
```
