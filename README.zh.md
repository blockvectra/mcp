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

默认入口直接连接官方 `StreamableHTTPClientTransport` 与 `StdioServerTransport`，不重建能力或工具表。在 JSON 消息层面保留 initialize 参数及结果、capabilities、instructions、protocolVersion、工具结果、JSON-RPC 错误、notifications 和双向请求（不保证字节排版一致）。收到成功的 initialize response 后，先设置 HTTP transport 的协商版本，再转发响应。stdout 仅包含 MCP 消息；stderr 只输出固定诊断文案，不输出 SDK 错误原文。EOF、SIGINT、SIGTERM 关闭两个 transport；transport 失败关闭桥接并以状态码 1 退出。HTTP/SSE、解析和重连行为沿用 SDK。

依赖固定为官方 `@modelcontextprotocol/client` 与 `@modelcontextprotocol/server` **2.3.1**；其发布包 export 与源码提供上述 transport，要求 Node >=20。依据见[官方 SDK 仓库及版本发布](https://github.com/modelcontextprotocol/typescript-sdk/releases)与[连接文档](https://ts.sdk.modelcontextprotocol.io/v2/clients/connect)。截至 2026-10-13，[Node 官方版本表](https://nodejs.org/en/about/previous-releases)将 Node 20 列为 EOL、Node 22 列为 LTS，因此本包要求 **Node >=22**。

本地验证：`npm test` 仅串行运行 mock HTTP 与真实 stdio 子进程测试；`npm pack --dry-run` 检查包内容。无需 build。

## 从源码运行双工具文档连接

只需要 `search_docs` 和 `read_doc` 的接入助手，可用 Node.js 22+ 一条命令安装并运行源码快照：

```bash
npx --yes --package https://github.com/blockvectra/mcp/archive/refs/tags/docs-stdio-20261029.tar.gz blockvectra-docs-mcp
```

它会下载源码快照并安装依赖，无需 BlockVectra 账号或 key。可复现部署时，可将包 URL 中的 tag 改为该快照的完整 commit SHA。

如果使用源码 checkout，先运行 `npm ci`，再启动文档入口：

```bash
node /absolute/path/to/blockvectra-mcp/src/docs-cli.js
```

为 stdio 客户端配置 `command: "node"`，唯一参数为该绝对路径。此入口只列出两个文档工具，其他工具调用和非文档方法在本地拒绝后不会转发；即使继承了 `BLOCKVECTRA_API_KEY`，也不转发该请求头。它还省略其他服务端能力，不向客户端暴露 sampling、roots 等反向请求。

默认 `src/cli.js` 仍是上文说明的完整桥接。已发布的 `@blockvectra/mcp@0.1.0` 不包含这个新入口，请使用上述源码快照或 checkout。它限制的是这条 MCP 连接，不限制宿主 Agent 的其他工具、shell 或网络权限；模型与托管费用另计。

## 一行接入

服务器地址（Streamable HTTP，无需 key）：`https://docs.blockvectra.com/mcp`

| 客户端 | 一行命令 / 链接 | 出处 |
| --- | --- | --- |
| Claude Code | `claude mcp add --transport http blockvectra-docs https://docs.blockvectra.com/mcp` | [MCP in Claude Code](https://code.claude.com/docs/en/mcp) |
| Claude Code 插件（MCP 服务器 + `blockvectra-rpc` 技能） | `/plugin marketplace add blockvectra/mcp`，然后 `/plugin install blockvectra-docs@blockvectra` | [Create a marketplace](https://code.claude.com/docs/en/plugin-marketplaces) |
| Cursor | [Add to Cursor](https://cursor.com/link/mcp/install?name=blockvectra-docs&config=eyJ1cmwiOiJodHRwczovL2RvY3MuYmxvY2t2ZWN0cmEuY29tL21jcCJ9) | [MCP install links](https://cursor.com/docs/mcp/install-links) |
| VS Code | `code --add-mcp '{"name":"blockvectra-docs","type":"http","url":"https://docs.blockvectra.com/mcp"}'` | [Use MCP servers in VS Code](https://code.visualstudio.com/docs/agent-customization/mcp-servers) |
| Gemini CLI | `gemini extensions install https://github.com/blockvectra/mcp --ref main` | [Gemini CLI extensions](https://geminicli.com/docs/extensions/reference/) |
| Antigravity | `agy plugin install https://github.com/blockvectra/mcp` | [Antigravity 插件](https://www.antigravity.google/docs/plugins?tab=cli) |

- **地址：** `https://docs.blockvectra.com/mcp`（Streamable HTTP，无状态）
- **认证：** 可选请求头 `x-api-key`（BlockVectra API key），也接受 `Authorization: Bearer <key>`。没有 key 时可使用文档、链、价格、状态类工具，以及各链公开端点允许的 JSON-RPC 方法。
- **切勿**把 API key 或私钥写进工具参数或聊天；服务器只从 HTTP 请求头读取 key。

链列表、价格和限额会变化，本文不列出，请实时查询：

- 支持的链：`GET https://api.blockvectra.com/v1/chains`
- 套餐、价格与限额：`GET https://console-api.blockvectra.com/v1/plans`
- 服务状态：`GET https://api.blockvectra.com/v1/status`

更多：[BlockVectra for agents](https://blockvectra.com/en/agents/?ref=gh-mcp)、[AI Agent 接入指南](https://docs.blockvectra.com/en/guides/ai-agents/?ref=gh-mcp)（英文）。

## goose：免密钥查阅文档

先在 [goose](https://goose-docs.ai/) 中配置自己的模型提供方。文档工具不需要 BlockVectra 账号或 API key。

下载并运行[文档查询 recipe](recipes/goose-docs.json)，只需这个 JSON 文件，无需检出整个仓库：

```bash
curl --fail --location --output blockvectra-goose-docs.json \
  https://raw.githubusercontent.com/blockvectra/mcp/8c99c0e499166d8ba2163536f8d150571783c0a3/recipes/goose-docs.json
goose recipe validate blockvectra-goose-docs.json
goose run --recipe blockvectra-goose-docs.json
```

它先用 `search_docs` 查找 Robinhood Chain 主网接入文档，再用 `read_doc` 读取其中一页。recipe 只列出这两个工具，不包含 RPC、账号或交易工具。成功结果应引用文档，并说明哪些接入步骤需要 key。模型调用仍使用你在 goose 配置的额度或计费方案。

如果需要交互会话，可以仅为本次会话连接远程扩展：

```bash
goose session --with-streamable-http-extension "https://docs.blockvectra.com/mcp"
```

该会话会发现完整工具目录；文档 recipe 是工具范围更小的起点。参见 [goose 扩展说明](https://goose-docs.ai/docs/getting-started/using-extensions/)和 [recipe 参考](https://goose-docs.ai/docs/guides/recipes/recipe-reference/)。

## 可复用的 RPC 文档 Agent

小型托管演示可使用[指令和验收用例](recipes/rpc-docs-agent/README.zh.md)，复用上述双工具文档任务。这是提示与演示说明，不是 Lagrange manifest 或已验证的部署；宿主工具过滤、模型及托管计费需要分别处理。

## n8n：离线 proposal 校验

在普通 n8n MCP Client 工作流中，[该配方](recipes/n8n-zero-budget.md)说明了如何在任何 MCP 节点运行之前，离线校验一个拟发起的 `rpc_call`。粘贴 [Code 节点代码](recipes/n8n-zero-budget-code.txt)，并对照[fixture](recipes/n8n-zero-budget-fixtures.json)检查。可信预算为零时，每份回执都只是咨询性比对，调度结果恒为 `DENY`。它不是资金授权或执行，也没有在真实 n8n 实例中运行过。设置步骤与限制见该指南。

## Gemini CLI 扩展

扩展通过远程 Streamable HTTP 直接连接 `https://docs.blockvectra.com/mcp`，不需要本地 stdio 桥接或 npm。

安装后重启 Gemini CLI，运行 `/mcp` 查看可用工具。先调用 `list_chains`，再用 `read_doc` 传入 `path=quickstart`、`lang=zh` 试读文档。

### 可选认证

扩展默认无需 key：文档、发现、价格与状态保持免 key；RPC 是否免 key 取决于各链公共方法策略；已索引数据和账户工具需要你自己的 BlockVectra API key。不要把 key 放进 argv、工具参数、聊天或版本控制，也不要在 shell 历史中导出真实 key。请在启动 Gemini 前，通过现有的私有 secret manager 或私有启动环境，让 `BLOCKVECTRA_API_KEY` 出现在 Gemini 的进程环境中；仅放在 `.gemini/.env` 不足以保证生效。

如需通过请求头提供 key，请把下面的配置合并进用户级 `~/.gemini/settings.json`，不要覆盖其他设置：

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

该用户级配置会覆盖扩展中同名的服务器。配置后重启 Gemini CLI。`gemini mcp list` 或 `/mcp` 只检查连通性，不代表账户或数据授权成功；如需确认认证，请主动调用只读的 `get_account`，并妥善保密返回的账户数据。

已用官方 Gemini CLI 0.65.0 配合本地 mock 与合成 key 验证；这验证的是客户端配置和请求头传递，不代表真实 key 的工具调用验证。参见 [Gemini CLI MCP 自定义请求头](https://geminicli.com/docs/tools/mcp-server/#http-based-mcp-server-with-custom-headers)。

## Antigravity 插件

插件通过远程 Streamable HTTP 直接连接 `https://docs.blockvectra.com/mcp`，不需要本地 stdio 桥接或 npm。

### 安装到当前项目

在项目根目录运行：

```bash
mkdir -p .agents/plugins/blockvectra-docs
curl --fail --location https://raw.githubusercontent.com/blockvectra/mcp/antigravity-v0.1.0/plugin.json --output .agents/plugins/blockvectra-docs/plugin.json
curl --fail --location https://raw.githubusercontent.com/blockvectra/mcp/antigravity-v0.1.0/mcp_config.json --output .agents/plugins/blockvectra-docs/mcp_config.json
```

在该目录启动 `agy`。首次检查可让它以 `{"query":"Antigravity","lang":"en","limit":1}` 调用 `search_docs`。项目内加载和这一次免 key 文档搜索已用 Antigravity CLI 1.4.7 实测通过。

[官方插件指南](https://www.antigravity.google/docs/plugins/)介绍了项目级和全局安装。上面的命令把插件放在当前项目的 `.agents/plugins/` 目录中。

### 安装后使用

安装后重启 Antigravity，运行 `/mcp` 查看可用工具。先调用 `list_chains`，再以 `path=quickstart`、`lang=zh` 调用 `read_doc`。

插件默认无需 key：文档、发现、价格与状态保持免 key；RPC 是否免 key 取决于各链公共方法策略；已索引数据和账户工具需要你自己的 BlockVectra API key。不要把 key 放进工具参数、聊天或版本控制。如需通过请求头提供 key，请按 [Antigravity MCP 文档](https://www.antigravity.google/docs/mcp/)及客户端的私有请求头配置进行设置。

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

### Cursor（`.cursor/mcp.json`）

把此服务合入项目的 `.cursor/mcp.json`，保留已有服务配置：

```json
{
  "mcpServers": {
    "blockvectra-docs": {
      "url": "https://docs.blockvectra.com/mcp"
    }
  }
}
```

使用 Cursor CLI 时，在该项目目录执行以下命令，允许连接并查看工具列表：

```bash
agent mcp enable blockvectra-docs
agent mcp list-tools blockvectra-docs
```

参见 [Cursor CLI MCP 命令](https://cursor.com/docs/cli/mcp)。


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
