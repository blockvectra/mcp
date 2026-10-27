# n8n preflight comparison fixtures

Load `n8n-zero-budget-fixtures.json` as offline input/expected-output data for a proposed adapter before a `rpc_call` invocation. These two cases use the same fixed synthetic policy and requested interval:

| Case | Within approved scope | Covers requested interval | Decision |
|---|---|---|---|
| `narrowed_interval` (`0x11..0x1f`) | true | false | DENY |
| `exact_interval` (`0x10..0x1f`) | true | true | DENY |

Both budgets are zero, so both expected receipts deny dispatch. Keep the approved policy and requested interval in trusted workflow configuration, separate from model-proposed tool arguments. The JSON is fixture data, not a policy authority or a permission check to trust from a caller. Positive-budget authorization, accounting, and replay handling are outside this fixture.

For offline comparison, stop at the receipt with no MCP node or credentials attached. n8n's [MCP Client](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcpClient/) is a regular workflow step; its [MCP Client Tool](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolmcp/) connects tools to an AI Agent. An IF node elsewhere in the workflow does not by itself establish that every agent tool invocation passes through this comparison. Test the actual invocation boundary before enabling a connected workflow.

The scope/coverage/decision projections were checked locally with the [previously published Python comparator](https://github.com/Circadian-agent/agent-collective/issues/1#issuecomment-6415600111). No n8n runtime, MCP invocation, credentials, RPC, payment, or settlement was exercised. This is not an importable n8n workflow or a signed execution receipt.
