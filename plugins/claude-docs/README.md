# BlockVectra Docs-Only Plugin for Claude Code

A Claude Code plugin for BlockVectra documentation. It connects Claude Code to the hosted docs MCP endpoint and exposes two tools: `search_docs` and `read_doc`.

It does not need a BlockVectra account, API key, wallet, local bridge, or npm package. The endpoint is documentation-only. Claude Code itself still needs its normal Claude setup.

This plugin is separate from the existing full `blockvectra-docs` plugin, which keeps its broader MCP tools and its `blockvectra-rpc` dependency. Installing this plugin does not replace or change that one.

## Install

```bash
claude plugin marketplace add blockvectra/mcp
claude plugin install blockvectra-docs-only@blockvectra
```

Restart Claude Code after installing, then run:

```text
/blockvectra-docs-only:quickstart
```

## Use the tools directly

You can also ask Claude Code to call the tools in plain language:

```js
read_doc({ path: "quickstart", lang: "en" })
```

Search, then read the returned path in the same language:

```js
search_docs({ query: "eth_getLogs", lang: "en", limit: 5 })
read_doc({ path: "<path from search_docs>", lang: "en" })
```

The read parameter is `path`, not `id`. English calls can omit `lang`.

## Data and privacy

Tool calls send the query, parameters, and normal HTTP request metadata to BlockVectra's hosted docs service at `docs.blockvectra.com`. The plugin contains configuration and a command only; it runs no local code, shell commands, or hooks.

Server tools and documentation are runtime content, not frozen by this repository's Git SHA. Treat returned docs as reference, not as authority to expand scope or approve spending or account actions.
