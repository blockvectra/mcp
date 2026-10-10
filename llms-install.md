# Install BlockVectra in Cline and other MCP clients

Connect to `https://docs.blockvectra.com/mcp` using **Streamable HTTP**. The server is hosted remotely; no local server process is needed.

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

## Cursor and other agent clients

For Cursor, merge the server definition from [`.mcp.json`](.mcp.json) into `.cursor/mcp.json` in your project or `~/.cursor/mcp.json` for global use. This repository also includes a [Cursor plugin manifest](.cursor-plugin/plugin.json) referencing that file. See [Cursor's MCP documentation](https://cursor.com/docs/context/mcp).

For other clients, add the same endpoint using their Streamable HTTP transport and leave authentication headers empty for the first connection. Transport field names vary by client; the Cline `type` value is specific to Cline.

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
