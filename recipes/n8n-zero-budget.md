# n8n preflight comparison fixtures

Load `n8n-zero-budget-fixtures.json` as offline input/expected-output data for a proposed adapter before a `rpc_call` invocation. These two cases use the same fixed synthetic policy and requested interval:

| Case | Within approved scope | Covers requested interval | Decision |
|---|---|---|---|
| `narrowed_interval` (`0x11..0x1f`) | true | false | DENY |
| `exact_interval` (`0x10..0x1f`) | true | true | DENY |

Both budgets are zero, so both expected receipts deny dispatch. Keep the approved policy and requested interval in trusted workflow configuration, separate from model-proposed tool arguments. The JSON is fixture data, not a policy authority or a permission check to trust from a caller. Positive-budget authorization, accounting, and replay handling are outside this fixture.

For offline comparison, stop at the receipt with no MCP node or credentials attached. n8n's [MCP Client](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcpClient/) is a regular workflow step; its [MCP Client Tool](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolmcp/) connects tools to an AI Agent. An IF node elsewhere in the workflow does not by itself establish that every agent tool invocation passes through this comparison. Test the actual invocation boundary before enabling a connected workflow.

## Code node setup (regular MCP Client path)

The requester chose the regular MCP Client workflow step, not the AI Agent's MCP Client Tool. For these zero-budget fixtures the workflow stops at the receipt: no MCP Client node and no MCP credentials are connected.

1. Add a Code node. Set **Mode** to "Run Once for All Items" and **Language** to JavaScript (see the n8n [Code node docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/)).
2. Paste the full contents of `n8n-zero-budget-code.txt` into the editor. It uses `$input.all()` and returns one `{ json: receipt }` item per input item. It has no imports, I/O, logging, credentials, or MCP calls, and it has no ALLOW path.
3. Feed it items whose `json` contains only `{ "proposal": { "tool": "rpc_call", "arguments": { ... } } }`, supplied separately from the trusted configuration (for example, the `proposal` objects from the fixture cases).
4. Optionally add an IF node after it to inspect `scope_match` or `covers_requested_interval`. Both branches must remain disconnected from any MCP Client node; `dispatch_decision` is always `DENY`.

The approved policy and the requested interval live in the `TRUSTED_APPROVED` and `TRUSTED_REQUESTED` constants at the top of the pasted code, with the exact values from the fixtures. Only the workflow operator edits them. They are never read from incoming items, and any item with a root key other than `proposal` (including `approved`, `requested`, or changed `maxCalls`/`maxSpend`) gets a fail-closed DENY receipt with `scope_match=false` and `covers_requested_interval=false`. `Object.freeze` only prevents accidental mutation; it is not a trust boundary, so protect the node by controlling who can edit the workflow.

The proposal must have exactly `tool` (`rpc_call`) and `arguments`; `arguments` exactly `chain` (`robinhood_mainnet`), `method` (`eth_getLogs`) and `params`; `params` one filter object with exactly `address`, `fromBlock` and `toBlock`. Block numbers must be canonical lowercase hex (`0x0` or `0x[1-9a-f]...`, at most 256 bits), compared as `BigInt`, and `fromBlock` must not exceed `toBlock`. Each item is evaluated on its own, so one malformed item cannot affect another item's receipt. Receipts do not copy proposed fields. A receipt is a local advisory comparison, not an authorization, settlement, or signed evidence.

Run the local checks with:

```
node --test recipes/n8n-zero-budget-code.test.mjs
```

What this evidence covers: the test file loads the exact pasteable code into a plain Node function with a mock `$input` and checks both fixture receipts (deep equality, including reason order) plus mutation cases for injected root keys, extra keys, wrong values, wrong types, malformed or reversed intervals, out-of-scope intervals, 256-bit precision, and multi-item isolation. That harness is not the n8n runtime. There is no n8n version or runtime attestation, no workflow import was tested, and there is no positive-budget policy.

The scope/coverage/decision projections were checked locally with the [previously published Python comparator](https://github.com/Circadian-agent/agent-collective/issues/1#issuecomment-6415600111). No n8n runtime, MCP invocation, credentials, RPC, payment, or settlement was exercised. This is not an importable n8n workflow or a signed execution receipt.
