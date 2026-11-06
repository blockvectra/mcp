# RPC 失败不等于事件为空

日志扫描器可能在跳过一次失败的 `eth_getLogs` 请求后，仍返回一份看似合理的结果。下游因此把没有完整读取的区块窗口当作完整结果。

[AgentReader PR #1](https://github.com/grokbot1233/agentreader/pull/1) 已于 UTC 2026 年 11 月 6 日合入，修复了一个买方信号扫描器中的这一问题：按收款地址记录请求覆盖情况，并将该地址的部分结果排除在 lead 聚合之外。这是一例源码修复，不代表已经生产部署，也不代表采用了 BlockVectra RPC。

[English](rpc-scan-coverage.md)

## 保留“空结果”和“失败”的区别

成功返回 `[]`，表示提供方针对该过滤器和区间返回了零条匹配日志。超时或 RPC 错误不能给出这个答案。失败区间应保持可见，不能转换成空列表。

[合入后的实现](https://github.com/grokbot1233/agentreader/blob/dca08b6fc4dabc88f21b874325446ae50bcd29aa/scripts/outbound/scan.py) 在每个选定收款地址的 market 记录中附带 `coverage`：

- `from_block`、`to_block`：本次请求的窗口。
- `completed_ranges`：请求成功的区间，包括成功返回空列表的区间。
- `failed_ranges`：失败区间及错误文本。
- `complete`：任一区间失败后即为 false。

这些是 AgentReader 的字段，不是 BlockVectra API 响应 schema。

每个收款地址的日志独立暂存。它的任一区间失败，该地址的所有日志都不参与 lead 聚合。另一个收款地址若完整读取，仍可参与；同一钱包出现在两者中时，只计入它在完整收款地址上的贡献。

这是该扫描器选择的策略。其他应用可以展示部分结果，但必须明确缺失的覆盖范围，不能将其当作完整结果。

## 精确计算区块窗口

对于正整数 `blocks` 和已捕获的 head，闭区间从 `max(0, head - blocks + 1)` 开始，到 `head` 结束。接近创世块时，实际存在的区块可能少于请求数量。补丁在访问网络前拒绝非正数，并将窗口拆成不重叠、每段最多 10,000 块的区间。

10,000 块是这一实现的选择，不是所有提供方都支持的限制。生产读取仍需核对所选端点的方法、单次范围和历史保留边界。

## 复现离线回归

[合入源码中的七个测试方法](https://github.com/grokbot1233/agentreader/blob/dca08b6fc4dabc88f21b874325446ae50bcd29aa/scripts/outbound/test_scan.py) mock 了发现接口、RPC 和 sleep，覆盖成功空结果与失败的区别、部分收款地址的排除、收款地址之间的隔离、完整结果计数保持、共享收款地址去重、精确窗口／分段／创世边界，以及无效区块数量。

准备 Git 和 Python 3，在没有现存 `agentreader` 检出的目录中运行：

```bash
git clone https://github.com/grokbot1233/agentreader.git
cd agentreader
git checkout --detach dca08b6fc4dabc88f21b874325446ae50bcd29aa
python3 -B -m unittest discover -s scripts/outbound -p test_scan.py -v
```

执行测试，不执行扫描器 CLI。测试使用 mock RPC，不是线上提供方性能测试。提交的修复版七个方法通过；维护者在合入后也[报告七个测试通过](https://github.com/grokbot1233/agentreader/pull/1#issuecomment-6695019789)。

## 覆盖记录不能证明什么

请求成功不能独立证明提供方返回了全部匹配日志，也不能证明重组前后的所有分段属于同一条 canonical 链。此补丁没有新增这些检查。它同样不能证明转账发送方是自主 Agent、某项服务的付费客户或独立真人；多个资源还可能共享同一 `payTo` 地址。

构建读取器前，可通过 [RPC 文档](https://docs.blockvectra.com/zh/)核对所选链和方法。Agent 可使用[仅查文档的 MCP 入口](https://docs.blockvectra.com/mcp/docs)，无需账号或 API key，只有 `search_docs` 和 `read_doc`。该入口读取文档，不执行扫描。
