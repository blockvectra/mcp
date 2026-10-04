# BlockVectra MCP 服务器

[BlockVectra](https://blockvectra.com/zh/agents/?ref=gh-mcp) 的远程 [Model Context Protocol](https://modelcontextprotocol.io) 服务器：免 key 的多链 EVM JSON-RPC、已索引的 Data API、文档、价格与状态，面向 AI Agent。

[English](README.md)

- **地址：** `https://docs.blockvectra.com/mcp`（Streamable HTTP，无状态）
- **认证：** 可选请求头 `x-api-key`（BlockVectra API key），也接受 `Authorization: Bearer <key>`。没有 key 时可使用文档、链、价格、状态类工具，以及各链公开端点允许的 JSON-RPC 方法。
- **切勿**把 API key 或私钥写进工具参数或聊天；服务器只从 HTTP 请求头读取 key。

链列表、价格和限额会变化，本文不列出，请实时查询：

- 支持的链：`GET https://api.blockvectra.com/v1/chains`
- 套餐、价格与限额：`GET https://console-api.blockvectra.com/v1/plans`
- 服务状态：`GET https://api.blockvectra.com/v1/status`

更多：[BlockVectra for agents](https://blockvectra.com/en/agents/?ref=gh-mcp)、[AI Agent 接入指南](https://docs.blockvectra.com/en/guides/ai-agents/?ref=gh-mcp)（英文）。

## 工具

下表对应当前线上 `https://docs.blockvectra.com/mcp`（`serverInfo` 为 `blockvectra-docs` 1.0.0）。以 `tools/list` 返回为准。

| 工具 | 作用 | API key | 读 / 写 |
| --- | --- | --- | --- |
| `read_doc` | 读取某个文档页的原始 Markdown | 不需要 | 只读 |
| `search_docs` | 按关键词搜索文档标题、路径与摘要 | 不需要 | 只读 |
| `list_docs` | 列出全部文档页 | 不需要 | 只读 |
| `list_chains` | 支持的链、静态参数与方法策略（`GET /v1/chains`） | 不需要 | 只读 |
| `get_status` | 实时服务与网络状态（`GET /v1/status`） | 不需要 | 只读 |
| `get_pricing` | 套餐、CU 权重与限额（`GET /v1/plans`） | 不需要 | 只读 |
| `estimate_usage` | 按方法与日调用量估算 CU 与美元成本 | 不需要 | 只读 |
| `get_method_info` | JSON-RPC 方法在各链的可用性、CU 权重与价格 | 不需要 | 只读 |
| `explain_error` | 查询错误码或原因：是否计费、能否重试、建议动作 | 不需要 | 只读 |
| `how_to_get_api_key` | 获取 API key 的步骤（程序化 SIWE 注册或浏览器交接）及认证头格式 | 不需要 | 只读 |
| `rpc_call` | 在某条链上执行 JSON-RPC 2.0 方法 | 可选：无 key 时仅使用该链的免 key 公开端点（若有） | 可写（`destructiveHint: true`） |
| `data_api_get` | 查询某条链的 Data API 路径 | 必需 | 只读 |
| `get_account` | 当前 key 的余额、CU 与限速（`GET /v1/account`） | 必需 | 只读 |
| `get_deposit_address` | 账户专属链上充值地址与开放网络 | 必需 | 只读 |

说明：需要 key 的工具在没有 key 时会返回错误，并指向 `how_to_get_api_key`。

## 接入客户端

下列片段均依据各客户端自己的官方文档；可选的 key 请求头按该文档对自定义请求头的写法添加。

| 客户端 | 官方文档 |
| --- | --- |
| Claude Code | [MCP in Claude Code](https://code.claude.com/docs/en/mcp) |
| Cursor | [Model Context Protocol in Cursor](https://cursor.com/docs/context/mcp) |
| VS Code | [Use MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) |
| Codex | [Codex MCP](https://developers.openai.com/codex/mcp) |

### Claude Code

```bash
claude mcp add --transport http blockvectra https://docs.blockvectra.com/mcp
# 带 API key
claude mcp add --transport http blockvectra https://docs.blockvectra.com/mcp --header "x-api-key: $BLOCKVECTRA_API_KEY"
```

### Cursor（`mcp.json`）

```json
{
  "mcpServers": {
    "blockvectra": {
      "url": "https://docs.blockvectra.com/mcp",
      "headers": { "x-api-key": "<你的 key，可选>" }
    }
  }
}
```

### VS Code（`.vscode/mcp.json`）

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

### Codex（`~/.codex/config.toml`）

```toml
[mcp_servers.blockvectra]
url = "https://docs.blockvectra.com/mcp"
# 可选：从环境变量读取 key
env_http_headers = { "x-api-key" = "BLOCKVECTRA_API_KEY" }
```

## 注册表

`server.json` 以 `com.blockvectra/docs` 之名描述本服务器，用于[官方 MCP 注册表](https://registry.modelcontextprotocol.io)。发布由手动触发的工作流完成（`.github/workflows/publish.yml`）。

## 许可证

[MIT](LICENSE)
