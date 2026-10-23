# BlockVectra MCP 服务器

[BlockVectra](https://blockvectra.com/zh/agents/?ref=gh-mcp) 的远程 [Model Context Protocol](https://modelcontextprotocol.io) 服务器，面向 AI Agent 提供多链 EVM JSON-RPC、已索引 Data API、文档、价格与状态。文档、服务发现、价格与状态无需 API key；RPC 是否可免 key 使用取决于各链公共方法策略，已索引 Data API 与账户工具需要你自己的 BlockVectra API key。

[English](README.md)

## Robinhood Chain 主网与测试网任务导航

主网公共只读 RPC 任务请阅读[链 RPC 指南](https://docs.blockvectra.com/en/guides/robinhood-chain/)；测试网任务请阅读 [testnet starter](https://docs.blockvectra.com/en/guides/robinhood-testnet-starter/)和[faucet 指南](https://docs.blockvectra.com/en/guides/robinhood-testnet-faucet/)。主网公共读取无需先领取测试币。

连接 `https://docs.blockvectra.com/mcp`，无需请求头即可读取文档和发现服务。Robinhood Chain 公共端点允许的 RPC 读取无需 key；公共策略以外的方法需要 API key。Faucet 领水需要 `x-api-key`。HTTP `202` 仅表示已受理；应查询交易回执，确认链上执行成功（`status: "0x1"`），这不等于最终性。

## 本地 stdio 桥接

使用 Node.js 22 或更高版本运行 MIT 许可的 stdio 桥接：

```bash
npx --yes @blockvectra/mcp@0.1.0
```

为 stdio 客户端配置：

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

使用源码 checkout 时，先运行 `npm ci`，然后改用 `node` 和 `src/cli.js` 的绝对路径。

CLI 固定桥接到 `https://docs.blockvectra.com/mcp`，不接受命令行参数。可选地通过子进程环境或客户端的私有环境配置提供 `BLOCKVECTRA_API_KEY`，仅转发为 `x-api-key` 请求头。绝不将 key 放进 CLI 参数、工具参数或聊天，也不要提供私钥。

桥接直接连接官方 `StreamableHTTPClientTransport` 与 `StdioServerTransport`，不重建能力或工具表。在 JSON 消息层面保留 initialize 参数及结果、capabilities、instructions、protocolVersion、工具结果、JSON-RPC 错误、notifications 和双向请求（不保证字节排版一致）。收到成功的 initialize response 后，先设置 HTTP transport 的协商版本，再转发响应。stdout 仅包含 MCP 消息；stderr 只输出固定诊断文案，不输出 SDK 错误原文。EOF、SIGINT、SIGTERM 关闭两个 transport；transport 失败关闭桥接并以状态码 1 退出。HTTP/SSE、解析和重连行为沿用 SDK。

依赖固定为官方 `@modelcontextprotocol/client` 与 `@modelcontextprotocol/server` **2.3.1**；其发布包 export 与源码提供上述 transport，要求 Node >=20。依据见[官方 SDK 仓库及版本发布](https://github.com/modelcontextprotocol/typescript-sdk/releases)与[连接文档](https://ts.sdk.modelcontextprotocol.io/v2/clients/connect)。截至 2026-10-13，[Node 官方版本表](https://nodejs.org/en/about/previous-releases)将 Node 20 列为 EOL、Node 22 列为 LTS，因此本包要求 **Node >=22**。

本地验证：`npm test` 仅串行运行 mock HTTP 与真实 stdio 子进程测试；`npm pack --dry-run` 检查包内容。无需 build。

## 一行接入

服务器地址（Streamable HTTP，无需 key）：`https://docs.blockvectra.com/mcp`

| 客户端 | 一行命令 / 链接 | 出处 |
| --- | --- | --- |
| Claude Code | `claude mcp add --transport http blockvectra-docs https://docs.blockvectra.com/mcp` | [MCP in Claude Code](https://code.claude.com/docs/en/mcp) |
| Claude Code 插件（MCP 服务器 + `blockvectra-rpc` 技能） | `/plugin marketplace add blockvectra/mcp`，然后 `/plugin install blockvectra-docs@blockvectra` | [Create a marketplace](https://code.claude.com/docs/en/plugin-marketplaces) |
| Cursor | [Add to Cursor](https://cursor.com/link/mcp/install?name=blockvectra-docs&config=eyJ1cmwiOiJodHRwczovL2RvY3MuYmxvY2t2ZWN0cmEuY29tL21jcCJ9) | [MCP install links](https://cursor.com/docs/mcp/install-links) |
| VS Code | `code --add-mcp '{"name":"blockvectra-docs","type":"http","url":"https://docs.blockvectra.com/mcp"}'` | [Use MCP servers in VS Code](https://code.visualstudio.com/docs/agent-customization/mcp-servers) |
| Gemini CLI | `gemini extensions install https://github.com/blockvectra/mcp` | [Gemini CLI extensions](https://geminicli.com/docs/extensions/reference/) |

- **地址：** `https://docs.blockvectra.com/mcp`（Streamable HTTP，无状态）
- **认证：** 可选请求头 `x-api-key`（BlockVectra API key），也接受 `Authorization: Bearer <key>`。没有 key 时可使用文档、链、价格、状态类工具，以及各链公开端点允许的 JSON-RPC 方法。
- **切勿**把 API key 或私钥写进工具参数或聊天；服务器只从 HTTP 请求头读取 key。

链列表、价格和限额会变化，本文不列出，请实时查询：

- 支持的链：`GET https://api.blockvectra.com/v1/chains`
- 套餐、价格与限额：`GET https://console-api.blockvectra.com/v1/plans`
- 服务状态：`GET https://api.blockvectra.com/v1/status`

更多：[BlockVectra for agents](https://blockvectra.com/en/agents/?ref=gh-mcp)、[AI Agent 接入指南](https://docs.blockvectra.com/en/guides/ai-agents/?ref=gh-mcp)（英文）。

## Gemini CLI 扩展

扩展通过远程 Streamable HTTP 直接连接 `https://docs.blockvectra.com/mcp`，不需要本地 stdio 桥接或 npm。

安装后重启 Gemini CLI，运行 `/mcp` 查看可用工具。先调用 `list_chains`，再用 `read_doc` 传入 `path=quickstart`、`lang=zh` 试读文档。

默认不添加请求头时，文档、发现、价格与状态无需 key；RPC 取决于各链公共方法策略，已索引数据和账户工具需要你自己的 BlockVectra API key。认证方式请遵循客户端官方文档中的私有请求头配置。

## 工具

下表对应当前线上 `https://docs.blockvectra.com/mcp`。以 `tools/list` 返回为准。

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
| `rpc_call` | 在某条链上执行只读 JSON-RPC 2.0 方法 | 可选：无 key 时仅使用该链的免 key 公开端点（若有） | 只读 |
| `data_api_get` | 查询某条链的 Data API 路径 | 必需 | 只读 |
| `get_account` | 当前 key 的余额、CU 与限速（`GET /v1/account`） | 必需 | 只读 |
| `get_deposit_address` | 账户专属链上充值地址与开放网络 | 必需 | 只读 |
| `send_raw_transaction` | 在某条链上广播已签名的原始交易 | 可选：免 key 调用取决于该链公开方法策略 | 可写（`destructiveHint: true`） |

说明：需要 key 的工具在没有 key 时会返回错误，并指向 `how_to_get_api_key`。

## 在 Cursor / Cline 中使用

免 key 的 Cursor 配置见 [`.mcp.json`](.mcp.json)，由 [Cursor 插件清单](.cursor-plugin/plugin.json) 引用。Cline 的 Streamable HTTP 安装步骤及可选 `x-api-key` 请求头配置见 [llms-install.md](llms-install.md)（英文）。首次连接不填 headers，先调用 `list_chains`，再以 `{"path":"quickstart","lang":"en"}` 调用 `read_doc`。

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
# 可选 key 使用私有的环境变量请求头配置，见下方 Codex env_http_headers 示例。
# 绝不通过 CLI 参数传递 key。
```

### Cursor（`mcp.json`）

```json
{
  "mcpServers": {
    "blockvectra-docs": {
      "url": "https://docs.blockvectra.com/mcp"
    }
  }
}
```

### VS Code（`.vscode/mcp.json`）

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
