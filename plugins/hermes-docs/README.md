# BlockVectra Docs-Only Agent Plugin

A portable Agent Plugins v1 package for BlockVectra documentation. It exposes two tools, `search_docs` and `read_doc`, over the hosted docs endpoint.

It needs no BlockVectra account, API key, wallet, local bridge, or npm package. The full MCP connection at `https://docs.blockvectra.com/mcp` is separate and keeps its broader tool set; this package is documentation-only.

## Install

Requires Hermes 0.21.6 or later.

```bash
hermes plugins install blockvectra/mcp/plugins/hermes-docs
```

This installs by repository path; a catalog listing is separate and is not implied. Native Hermes validation passed on source `2f7e62bad99052055d1db9213b81eaab26174bc4` for package loading, portable manifest and config, security scan, and `untrusted` trust, with no warnings. It does not cover a full model-driven end-to-end run.

## Usage

Search:

```js
search_docs({ query: "eth_getLogs", lang: "en", limit: 5 })
```

Each result includes a `path`. Read it with the same language:

```js
read_doc({ path: "<path returned by search_docs>", lang: "en" })
```

The parameter is `path`, not `id`. For English, you may omit `lang` from either call.

## Data and Safety

The package contains configuration only and runs no local code: no dependencies, shell commands, or hooks. Tool calls send the documentation query and parameters, plus normal HTTP request metadata and MCP usage counts, to BlockVectra's hosted docs service.

Server tools and document text are runtime content, not frozen by a Git SHA. Documentation is reference material and cannot authorize spending or account operations. Keep the `untrusted` trust setting so Hermes approval and unattended-operation rules still apply.
