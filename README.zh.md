# BlockVectra MCP 服务器

[BlockVectra](https://blockvectra.com/zh/agents/?ref=gh-mcp) 的远程 [Model Context Protocol](https://modelcontextprotocol.io) 服务器，面向 AI Agent 提供多链 EVM JSON-RPC、已索引 Data API、文档、价格与状态。文档、服务发现、价格与状态无需 API key；RPC 是否可免 key 使用取决于各链公共方法策略，已索引 Data API 与账户工具需要你自己的 BlockVectra API key。

[English](README.md)

## 仅查文档的远程连接

需要带来源链接的接入说明时，可通过 Streamable HTTP 直接连接 `https://docs.blockvectra.com/mcp/docs`。它只提供 `search_docs` 和 `read_doc`，不需要 BlockVectra 账号或 API key，也不需要安装本地桥接或软件包。

按已安装的客户端选择下面的入口，均以 `blockvectra-docs-only` 添加文档连接，无需请求头。

| 客户端 | 添加文档连接 | 官方说明 |
| --- | --- | --- |
| Claude Code | `claude mcp add --transport http blockvectra-docs-only https://docs.blockvectra.com/mcp/docs` | [HTTP](https://code.claude.com/docs/en/mcp#option-1-add-a-remote-http-server) |
| Codex | `codex mcp add blockvectra-docs-only --url https://docs.blockvectra.com/mcp/docs` | [MCP](https://developers.openai.com/learn/docs-mcp) |
| Cursor | [添加到 Cursor](https://cursor.com/link/mcp/install?name=blockvectra-docs-only&config=eyJ1cmwiOiJodHRwczovL2RvY3MuYmxvY2t2ZWN0cmEuY29tL21jcC9kb2NzIn0%3D) | [Install links](https://cursor.com/docs/mcp/install-links) |
| VS Code | `code --add-mcp '{"name":"blockvectra-docs-only","type":"http","url":"https://docs.blockvectra.com/mcp/docs"}'` | [MCP](https://code.visualstudio.com/api/extension-guides/ai/mcp#add-mcp-servers-to-vs-code) |

然后可以问：“查找并读取 Robinhood Chain 接入指南，引用来源，区分主网与测试网；不要执行 RPC 或发送交易。”

软件包插件和 stdio 命令仍保持各自原有范围。使用 ToolHive 时，`--target-uri` 仍只填 origin，把本地客户端 URL 的路径改为 `/mcp/docs`。

双工具范围由服务器强制执行，提供 key 也不会增加工具。需要链发现、RPC、索引数据或账户工具时，使用下方完整的 `https://docs.blockvectra.com/mcp` 连接；同时使用两种连接时，保留不同服务名。

Registry 中 `com.blockvectra/docs` 的 `2.0.0` 版本指向这个双工具文档入口。既有 `1.x` 版本描述完整 `/mcp` 入口；需要发现、RPC 或需鉴权的数据工具时，请直接使用 `/mcp`。

## 用 Python 完成第一次文档读取

准备 Python 3.11+ 和 [uv](https://docs.astral.sh/uv/)，即可直接运行固定提交的示例，无需 Git 或克隆仓库：

```bash
uv run --script https://raw.githubusercontent.com/blockvectra/agent-quickstart/07b2d89f0ab9129c011d8b135dec441c6bde1f04/examples/mcp_docs.py
```

需要在本地阅读或修改示例时，也可使用[固定版本 Git checkout](https://github.com/blockvectra/agent-quickstart/releases/tag/python-mcp-docs-2026.11.06)：

```bash
git clone --branch python-mcp-docs-2026.11.06 --depth 1 https://github.com/blockvectra/agent-quickstart.git
cd agent-quickstart
uv run examples/mcp_docs.py
```

uv 会安装固定的 `mcp==2.3.0` 客户端依赖。示例连接 `/mcp/docs`，列出 `search_docs` 和 `read_doc`，然后读取英文 `quickstart`，输出包含工具名和完整 Markdown 正文的 JSON。无需 BlockVectra 账号、API key、钱包或模型 API；这个任务只读取文档。

## Robinhood Chain 主网与测试网任务导航

主网公共只读 RPC 任务请阅读[链 RPC 指南](https://docs.blockvectra.com/en/guides/robinhood-chain/)；测试网任务请阅读 [testnet starter](https://docs.blockvectra.com/en/guides/robinhood-testnet-starter/)和[faucet 指南](https://docs.blockvectra.com/en/guides/robinhood-testnet-faucet/)。主网公共读取无需先领取测试币。

连接 `https://docs.blockvectra.com/mcp`，无需请求头即可读取文档和发现服务。Robinhood Chain 公共端点允许的 RPC 读取无需 key；公共策略以外的方法需要 API key。Faucet 领水需要 `x-api-key`。HTTP `202` 仅表示已受理；应查询交易回执，确认链上执行成功（`status: "0x1"`），这不等于最终性。

配置 MCP 客户端之前，也可以先用[免 key TypeScript Quickstart 固定版](https://github.com/blockvectra/agent-quickstart/releases/tag/keyless-chain-id-2026.11.02)检查主网 RPC。需要 Node.js 22（>=22.18）或 Node.js >=24.12，以及 Git：

```bash
git clone --branch keyless-chain-id-2026.11.02 --depth 1 https://github.com/blockvectra/agent-quickstart.git
cd agent-quickstart
node src/public-read-cli.ts
```

要读取其他链，传入十进制链 ID：`node src/public-read-cli.ts 56` 读取 BNB Smart Chain，改为 `1` 读取 Ethereum 主网，改为 `57073` 读取 Ink。不传参数时，默认读取 Robinhood 主网（`4663`）。

无需安装依赖、钱包、账户或 API key。程序读取链目录、核对链 ID，再读取最新块号，最多三个 HTTP 请求，其中两个是 RPC。若目录未声明所需公共端点和方法，会在 RPC 前停止。

相关案例：[RPC 失败不等于事件为空](guides/rpc-scan-coverage.zh.md)，附上游已合入修复、离线回归和覆盖边界。

## 读取 Robinhood Chain 上的 HoodFi 名称记录

查询 HoodFi 名称保存的地址，请使用 [HoodFi 名称记录指南](https://docs.blockvectra.com/zh/guides/hoodfi-name-records/?ref=gh-mcp-hoodfi)。指南选取 Robinhood coin type `2147488311`，并在同一 canonical block hash 比较 coin type `60`。Robinhood 记录缺失或无效时停止，不能回退到 coin type 60；两条记录不同时，先确认 Robinhood 收款地址再使用。

配置上方文档连接后，可以这样提问：“查找并阅读 HoodFi 名称记录指南，解释如何选择 Robinhood 记录、在同一块哈希比较两种 coin type，以及出错时如何停止。引用来源，不执行 RPC 或发送交易。”

查阅指南无需 key；运行其中最多四次请求的诊断脚本，需要你自己的 API key，通过带 key RPC 端点的 `x-api-key` 请求头传入。不要把凭据写入提示词或工具参数。诊断只读取记录，不转账。

## 编程 Agent 文档 Skill

要让 Agent 查找接入步骤并附上来源，可在自己的项目目录安装 [blockvectra-docs Skill](https://github.com/blockvectra/agent-quickstart/tree/main/skills/blockvectra-docs)。需要 Node.js 22.20 或更新版本。按所用 Agent 选择下面的命令，安装在当前项目内，跳过安装器交互提示：

```bash
# Codex
npx --yes skills@1.7.4 add blockvectra/agent-quickstart --skill blockvectra-docs --agent codex --yes

# Claude Code
npx --yes skills@1.7.4 add blockvectra/agent-quickstart --skill blockvectra-docs --agent claude-code --yes
```

试着问：“如何开始使用 Robinhood Chain？请区分主网与测试网，并引用文档来源。”

Skill 通过已配置的 BlockVectra MCP（先 `search_docs`，再 `read_doc`）或 Agent 的 HTTP 阅读工具查找并读取 Markdown 页面。查文档无需 BlockVectra 账户或 API key。RPC、已索引数据与账户工具的 MCP 连接配置见下方。

## 一行接入

[![MCP 连接检查](https://mcp.aianytime.net/badge/blockvectra.svg)](https://mcp.aianytime.net/s/blockvectra/)

连接前，可查看 [AI Anytime 的独立报告](https://mcp.aianytime.net/s/blockvectra/)，了解最近一次 MCP 初始化和工具发现的结果。这些检查覆盖 MCP 连接，不代表各条链 RPC 调用的结果。

服务器地址（Streamable HTTP，无需 key）：`https://docs.blockvectra.com/mcp`

| 客户端 | 一行命令 / 链接 | 出处 |
| --- | --- | --- |
| Claude Code | `claude mcp add --transport http blockvectra-docs https://docs.blockvectra.com/mcp` | [MCP in Claude Code](https://code.claude.com/docs/en/mcp) |
| Codex | `codex mcp add blockvectra --url https://docs.blockvectra.com/mcp` | [Codex MCP 配置](https://developers.openai.com/learn/docs-mcp) |
| Claude Code 插件（MCP 服务器 + `blockvectra-rpc` 技能） | `/plugin marketplace add blockvectra/mcp`，然后 `/plugin install blockvectra-docs@blockvectra` | [Create a marketplace](https://code.claude.com/docs/en/plugin-marketplaces) |
| Cursor | [Add to Cursor](https://cursor.com/link/mcp/install?name=blockvectra-docs&config=eyJ1cmwiOiJodHRwczovL2RvY3MuYmxvY2t2ZWN0cmEuY29tL21jcCJ9) | [MCP install links](https://cursor.com/docs/mcp/install-links) |
| VS Code | `code --add-mcp '{"name":"blockvectra-docs","type":"http","url":"https://docs.blockvectra.com/mcp"}'` | [Use MCP servers in VS Code](https://code.visualstudio.com/docs/agent-customization/mcp-servers) |
| Gemini CLI | `gemini extensions install https://github.com/blockvectra/mcp --ref main` | [Gemini CLI extensions](https://geminicli.com/docs/extensions/reference/) |
| Antigravity | [项目级安装步骤](#antigravity-插件) | [Antigravity 插件](https://www.antigravity.google/docs/plugins?tab=cli) |
| OpenCode | [项目配置](#opencode-opencodejson) | [OpenCode MCP 服务](https://opencode.ai/v2/docs/mcp-servers/) |
| ToolHive | [本地 HTTP 代理](#toolhive本地-http-代理) | [ToolHive 代理参考](https://docs.stacklok.com/toolhive/reference/cli/thv_proxy) |

- **地址：** `https://docs.blockvectra.com/mcp`（Streamable HTTP，无状态）
- **认证：** 可选请求头 `x-api-key`（BlockVectra API key），也接受 `Authorization: Bearer <key>`。没有 key 时可使用文档、链、价格、状态类工具，以及各链公开端点允许的 JSON-RPC 方法。
- **切勿**把 API key 或私钥写进工具参数或聊天；服务器只从 HTTP 请求头读取 key。

链列表、价格和限额会变化，本文不列出，请实时查询：

- 支持的链：`GET https://api.blockvectra.com/v1/chains`
- 套餐、价格与限额：`GET https://console-api.blockvectra.com/v1/plans`
- 服务状态：`GET https://api.blockvectra.com/v1/status`

更多：[BlockVectra for agents](https://blockvectra.com/en/agents/?ref=gh-mcp)、[AI Agent 接入指南](https://docs.blockvectra.com/en/guides/ai-agents/?ref=gh-mcp)（英文）。

## 试一次链上读取

使用上方免 key 的 MCP 连接，把下面的任务交给 Agent：

> 调用一次 `list_chains`，找到 Ink（链 ID 57073），使用返回的 `chain` 标识。仅当其 `public.url` 存在，且 `public.methods` 同时包含 `eth_chainId` 和 `eth_blockNumber` 时继续。调用 `rpc_call`，传入该链、`method="eth_chainId"`、`params=[]`；将十六进制结果转为整数，不等于 57073 就停止。然后对同一链调用 `rpc_call`，传入 `method="eth_blockNumber"`、`params=[]`。给出链 ID、返回块号和本次观测的 UTC 时间。出错即停，不重试、不注册、不建 key、不发送交易。

此任务最多串行调用三个 MCP 工具，无需钱包、账户、API key、克隆仓库或本地 Node.js。成功读取只核对链身份并取得块号，不证明历史覆盖、索引新鲜度或性能。若接入的是下方仅文档 stdio 入口，它只提供 `search_docs` 和 `read_doc`；这个任务请使用上方完整远程连接。

## 本地 stdio 桥接

使用 Node.js 22 或更高版本运行 MIT 许可的 stdio 桥接：

```bash
npx --yes --package @blockvectra/mcp@0.1.0 blockvectra-mcp
```

这里使用 npm 已发布的 `0.1.0`。只需文档时，请使用下方带版本的 GitHub 安装包。

为 stdio 客户端配置：

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

使用源码 checkout 时，先运行 `npm ci`，然后改用 `node` 和 `src/cli.js` 的绝对路径。

CLI 固定桥接到 `https://docs.blockvectra.com/mcp`，不接受命令行参数。可选地通过子进程环境或客户端的私有环境配置提供 `BLOCKVECTRA_API_KEY`，仅转发为 `x-api-key` 请求头。绝不将 key 放进 CLI 参数、工具参数或聊天，也不要提供私钥。

默认入口直接连接官方 `StreamableHTTPClientTransport` 与 `StdioServerTransport`，不重建能力或工具表。在 JSON 消息层面保留 initialize 参数及结果、capabilities、instructions、protocolVersion、工具结果、JSON-RPC 错误、notifications 和双向请求（不保证字节排版一致）。收到成功的 initialize response 后，先设置 HTTP transport 的协商版本，再转发响应。stdout 仅包含 MCP 消息；stderr 只输出固定诊断文案，不输出 SDK 错误原文。EOF、SIGINT、SIGTERM 关闭两个 transport；transport 失败关闭桥接并以状态码 1 退出。HTTP/SSE、解析和重连行为沿用 SDK。

依赖固定为官方 `@modelcontextprotocol/client` 与 `@modelcontextprotocol/server` **2.3.1**；其发布包 export 与源码提供上述 transport，要求 Node >=20。依据见[官方 SDK 仓库及版本发布](https://github.com/modelcontextprotocol/typescript-sdk/releases)与[连接文档](https://ts.sdk.modelcontextprotocol.io/v2/clients/connect)。截至 2026-10-13，[Node 官方版本表](https://nodejs.org/en/about/previous-releases)将 Node 20 列为 EOL、Node 22 列为 LTS，因此本包要求 **Node >=22**。

本地验证：`npm test` 仅串行运行 mock HTTP 与真实 stdio 子进程测试；`npm pack --dry-run` 检查包内容。无需 build。

## 双工具文档连接

只需要 `search_docs` 和 `read_doc` 的接入助手，可用 Node.js 22+ 运行：

```bash
npx --yes --package https://github.com/blockvectra/mcp/releases/download/v0.1.1/blockvectra-mcp-0.1.1.tgz blockvectra-docs-mcp
```

它会安装 [GitHub 0.1.1 包](https://github.com/blockvectra/mcp/releases/tag/v0.1.1)及其依赖，无需 BlockVectra 账号或 key。该包包含双工具文档命令，npm 0.1.0 不包含；使用 GitHub 包无需等待 npm 0.1.1 发布。若先下载到本地安装，请先对照该发行版的 [SHA256SUMS](https://github.com/blockvectra/mcp/releases/download/v0.1.1/SHA256SUMS) 核验包摘要。

使用 `mcpServers` 配置的客户端需明确选择文档专用命令：

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

重启客户端，让它用 `search_docs` 查找 Robinhood Chain 接入指南，再用 `read_doc` 阅读一篇返回的文档。

如果使用源码 checkout，先运行 `npm ci`，再改用 `node /absolute/path/to/blockvectra-mcp/src/docs-cli.js`。此入口只列出两个文档工具，其他工具调用和非文档方法在本地拒绝后不会转发；即使继承了 `BLOCKVECTRA_API_KEY`，也不转发该请求头。它还省略其他服务端能力，不向客户端暴露 sampling、roots 等反向请求。

默认 `src/cli.js` 仍是上文说明的完整桥接。`@blockvectra/mcp@0.1.0` 不包含双工具文档入口。它限制的是这条 MCP 连接，不限制宿主 Agent 的其他工具、shell 或网络权限；模型与托管费用另计。

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

如果只需交互式查阅文档，无需下载 recipe，直接连接服务端限定范围的文档入口：

```bash
goose session --with-streamable-http-extension "https://docs.blockvectra.com/mcp/docs"
```

该 MCP 连接只提供 `search_docs` 和 `read_doc`。让 goose 查找 Robinhood Chain 接入指南、阅读并引用来源。需要链发现、RPC、索引数据或账号工具时，改用完整的 `https://docs.blockvectra.com/mcp` URL；认证遵循上文的工具与链策略。上面固定版本的 recipe 仍是连接完整入口的双工具 recipe。参见 [goose 扩展说明](https://goose-docs.ai/docs/getting-started/using-extensions/)和 [recipe 参考](https://goose-docs.ai/docs/guides/recipes/recipe-reference/)。

## ToolHive：本地 HTTP 代理

安装 [ToolHive CLI](https://docs.stacklok.com/toolhive/guides-cli/install) 后，在终端前台启动代理：

```bash
thv proxy blockvectra-docs --target-uri https://docs.blockvectra.com \
  --host 127.0.0.1 --port 55840
```

保持这个终端运行，在 MCP 客户端中添加 Streamable HTTP 地址 `http://127.0.0.1:55840/mcp`，认证请求头留空。如果端口已占用，两处同时改用其他空闲端口。用完后按 Ctrl+C 停止代理。

ToolHive **0.62.0** 的 `--target-uri` 只接受 origin；在这里加 `/mcp` 会在连接前失败。客户端地址需要保留 `/mcp`，代理会将该路径转发到远程服务器。参见[该版本的目标地址校验](https://github.com/stacklok/toolhive/blob/v0.62.0/cmd/thv/app/proxy.go#L587-L590)。

首次检查可让客户端以 `{"path":"guides/mcp-server","lang":"zh"}` 调用 `read_doc`，并展示返回的文档来源链接。不需要 BlockVectra 账号、钱包或 API key。代理会暴露远程服务器的完整工具目录；这一步只读取文档。

2026-11-05 已用 ToolHive 0.62.0 验证该代理路径的初始化、工具发现及一次英文 `read_doc` 成功；未验证链上 RPC、索引数据或账户工具。模型提供方的配置和费用仍由你的 MCP 客户端处理。

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

免 key 的 Cursor 配置见 [`.mcp.json`](.mcp.json)，由 [Cursor 插件清单](.cursor-plugin/plugin.json) 引用。Cline 的 Streamable HTTP 安装步骤及可选 `x-api-key` 请求头配置见 [llms-install.md](llms-install.md)（英文）。终端用户可按 [Cline CLI 安装命令](llms-install.md#cline-cli)添加服务器，随后启动新的 Cline 会话，以 `{"path":"guides/mcp-server","lang":"en"}` 调用 `read_doc`；该英文文档读取路径已验证，不需要 BlockVectra API key。首次连接不填 headers，先调用 `list_chains`，再以 `{"path":"quickstart","lang":"en"}` 调用 `read_doc`。

## Kilo CLI：项目内连接

按 [Kilo CLI 接入步骤](llms-install.md#kilo-cli)把托管服务器加入 `kilo.json`，检查连接，再让 Agent 试读一篇文档。Kilo CLI 的配置使用 `"type": "remote"`；查阅文档不需要 BlockVectra API key。

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
claude mcp list
```

检查输出是否显示 `Connected`。[Claude Code 2.1.280 连接记录](https://gist.github.com/gjwang/4ec1d04cdc5a1ed99c65ec334e0ca51a)提供实际输出与配置范围。

需要 key 的工具：启动 Claude Code 前设置 `BLOCKVECTRA_API_KEY`，在服务配置中使用 `"headers": {"x-api-key": "${BLOCKVECTRA_API_KEY}"}`。参见 [Claude Code 环境变量展开说明](https://code.claude.com/docs/en/mcp#environment-variable-expansion-in-mcpjson)。文件只保留变量引用，绝不通过 CLI 参数传递 key。

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

### OpenCode (`opencode.json`)

先用 `opencode --version` 查看版本，再把对应配置合并到项目的 `opencode.json`。连接和读取文档不需要 BlockVectra 账号或 key。

**OpenCode 2** 把服务放在 `mcp.servers` 下：

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

**OpenCode 1** 直接放在 `mcp` 下：

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

在该项目运行 `opencode mcp list`，确认 `blockvectra` 显示已连接。首次可以让 OpenCode 用 `search_docs` 和 `read_doc` 查找、读取 Robinhood Chain 主网接入指南并引用页面；这项任务不需要 RPC 或交易。

需要 key 的工具可从本地环境变量读取：先设置 `BLOCKVECTRA_API_KEY`，再在 `blockvectra` 服务对象中加入 `"headers": {"x-api-key": "{env:BLOCKVECTRA_API_KEY}"}`。不要把 key 写进文件或聊天；这里不会展开 `$BLOCKVECTRA_API_KEY` 这类 shell 写法。按版本参阅 [v2 MCP 指南](https://opencode.ai/v2/docs/mcp-servers/)或 [v1 MCP 指南](https://docs.opencode.ai/docs/mcp-servers/)。

## 注册表

`server.json` 以 `com.blockvectra/docs` 之名描述本服务器，用于[官方 MCP 注册表](https://registry.modelcontextprotocol.io)。发布由手动触发的工作流完成（`.github/workflows/publish.yml`）。

## 许可证

[MIT](LICENSE)
