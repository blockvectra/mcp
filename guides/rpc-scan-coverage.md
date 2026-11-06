# An RPC failure is not an empty event range

A log scanner can return a plausible list while silently skipping a failed `eth_getLogs` request. Consumers then see an apparently complete result, although part of the requested block window was never read successfully.

[AgentReader PR #1](https://github.com/grokbot1233/agentreader/pull/1), merged on 6 November 2026 UTC, addresses this in a buyer-signal scanner. The change records request coverage for each payment recipient and excludes that recipient’s partial results from lead aggregation. This is a source-level case study; it does not establish a production deployment or BlockVectra RPC adoption.

[中文](rpc-scan-coverage.zh.md)

## Preserve the difference between empty and failed

A successful `[]` response means the provider returned no matching logs for that filter and range. A timeout or RPC error gives no such answer. Keep the failed range visible instead of converting it to an empty list.

The [merged implementation](https://github.com/grokbot1233/agentreader/blob/dca08b6fc4dabc88f21b874325446ae50bcd29aa/scripts/outbound/scan.py) attaches `coverage` to each selected recipient’s market row:

- `from_block` and `to_block` describe the requested window.
- `completed_ranges` records successful requests, including successful empty results.
- `failed_ranges` records the failed intervals and error text.
- `complete` becomes false when any interval fails.

These are AgentReader fields, not a BlockVectra API response schema.

Logs are held separately for each recipient. If any of its intervals fails, none of that recipient’s logs contribute to the aggregated leads. A complete recipient can still contribute even when another fails. If a wallet appears in both, only its contributions from complete recipients are counted.

That is the policy chosen for this scanner. Another application may expose partial results, but it must make the missing coverage explicit rather than present the result as complete.

## Make the window exact

For a positive `blocks` value and a captured head, the inclusive window starts at `max(0, head - blocks + 1)` and ends at `head`. Near genesis, fewer blocks may exist than requested. The patch rejects non-positive block counts before network access and splits the window into non-overlapping chunks of at most 10,000 blocks.

The 10,000-block chunk is this implementation’s choice, not a universal provider limit. A production reader still needs to check the selected endpoint’s method, range and history constraints.

## Reproduce the offline regressions

The [seven test methods in the merged source](https://github.com/grokbot1233/agentreader/blob/dca08b6fc4dabc88f21b874325446ae50bcd29aa/scripts/outbound/test_scan.py) mock discovery, RPC and sleep. They cover successful-empty versus failed requests, partial-recipient exclusion, independent recipients, unchanged complete-result counts, shared-recipient deduplication, exact windows/chunking/genesis, and invalid block counts.

With Git and Python 3, in a directory without an existing `agentreader` checkout:

```bash
git clone https://github.com/grokbot1233/agentreader.git
cd agentreader
git checkout --detach dca08b6fc4dabc88f21b874325446ae50bcd29aa
python3 -B -m unittest discover -s scripts/outbound -p test_scan.py -v
```

Run the tests, not the scanner’s CLI. The tests use mocked RPCs; they are not a live-provider benchmark. The seven methods passed on the submitted fix, and the maintainer [reported seven passing tests after merging](https://github.com/grokbot1233/agentreader/pull/1#issuecomment-6695019789).

## What coverage does not prove

Successful requests do not independently prove that a provider returned every matching log or that all chunks belong to one canonical chain across a reorganization. The patch does not add those checks. It also does not prove that a transfer sender is an autonomous agent, a paying customer of a particular service, or a unique person. A shared `payTo` address can represent several resources.

Before building a reader, consult the [RPC documentation](https://docs.blockvectra.com/en/) for the selected chain and method. Agents can use the [documentation-only MCP endpoint](https://docs.blockvectra.com/mcp/docs): `search_docs` and `read_doc`, without an account or API key. That endpoint reads documentation; it does not execute scans.
