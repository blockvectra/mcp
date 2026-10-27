import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const code = readFileSync(new URL('./n8n-zero-budget-code.txt', import.meta.url), 'utf8');
const fixtures = JSON.parse(readFileSync(new URL('./n8n-zero-budget-fixtures.json', import.meta.url), 'utf8'));
// Local harness only: wraps the pasted body in a function with a mock $input. Not the n8n runtime.
const run = new Function('$input', code);
const exec = (...jsons) => run({ all: () => jsons.map((json) => ({ json })) }).map((o) => o.json);
const one = (json) => exec(json)[0];

const base = () => structuredClone(fixtures.cases[1].input.proposal);
const withFilter = (patch) => { const p = base(); Object.assign(p.arguments.params[0], patch); return { proposal: p }; };

function assertDenied(r) {
  assert.equal(r.dispatch_decision, 'DENY');
  assert.equal(r.budget_allows_dispatch, false);
  assert.equal(r.execution_observed, false);
  assert.equal(r.settlement_verified, false);
  assert.equal(r.receipt_kind, 'local_advisory_comparison');
  assert.ok(r.reasons.includes('zero_spend_or_call_budget'));
}

for (const c of fixtures.cases) {
  test(`fixture ${c.name} matches full expected receipt`, () => {
    assert.deepEqual(one({ proposal: c.input.proposal }), c.expected);
  });
}

test('root approved/requested injection fails closed', () => {
  const proposal = base();
  const injections = [
    { approved: { maxCalls: 5, maxSpendUsdc: '100' } },
    { requested: { fromBlock: '0x11', toBlock: '0x1f' } },
    { approved: fixtures.cases[0].input.approved },
    { maxCalls: 1 },
    { maxSpend: '1' },
  ];
  for (const extra of injections) {
    const r = one({ proposal, ...extra });
    assertDenied(r);
    assert.equal(r.scope_match, false);
    assert.equal(r.covers_requested_interval, false);
    assert.ok(r.reasons.includes('invalid_input_shape'));
  }
});

test('extra keys in proposal, arguments, filter fail closed', () => {
  const mutators = [
    (p) => { p.extra = 1; },
    (p) => { p.arguments.extra = 1; },
    (p) => { p.arguments.params[0].extra = 1; },
    (p) => { p.arguments.params.push({}); },
  ];
  for (const m of mutators) {
    const p = base(); m(p);
    const r = one({ proposal: p });
    assertDenied(r);
    assert.equal(r.scope_match, false);
    assert.equal(r.covers_requested_interval, false);
  }
});

test('wrong chain/method/tool/address are not in scope', () => {
  const cases = [
    (p) => { p.arguments.chain = 'other'; },
    (p) => { p.arguments.method = 'eth_call'; },
    (p) => { p.tool = 'other_tool'; },
    (p) => { p.arguments.params[0].address = '0x2222222222222222222222222222222222222222'; },
    (p) => { p.arguments.params[0].address = '0x1111111111111111111111111111111111111111 '; },
  ];
  for (const m of cases) {
    const p = base(); m(p);
    const r = one({ proposal: p });
    assertDenied(r);
    assert.equal(r.scope_match, false);
    assert.equal(r.covers_requested_interval, false);
  }
});

test('null, missing, array, wrong-type shapes fail closed', () => {
  const noTool = base(); delete noTool.tool;
  const noArgs = base(); delete noArgs.arguments;
  const noParams = base(); delete noParams.arguments.params;
  const noFrom = base(); delete noFrom.arguments.params[0].fromBlock;
  const arrParams = base(); arrParams.arguments.params = {};
  const arrProposal = [base()];
  const bad = [
    null, 'x', 7, [], {}, { proposal: null }, { proposal: arrProposal }, { proposal: 'x' },
    { proposal: noTool }, { proposal: noArgs }, { proposal: noParams }, { proposal: noFrom },
    { proposal: arrParams }, { proposal: { ...base(), arguments: [] } },
    { proposal: { ...base(), arguments: { ...base().arguments, params: [null] } } },
    { proposal: { ...base(), arguments: { ...base().arguments, params: [[]] } } },
    withFilter({ fromBlock: 16 }), withFilter({ toBlock: null }), withFilter({ address: 1 }),
    withFilter({ fromBlock: ['0x10'] }),
  ];
  for (const b of bad) {
    const r = exec(b)[0];
    assertDenied(r);
    assert.equal(r.scope_match, false);
    assert.equal(r.covers_requested_interval, false);
  }
  // item without a json object at all
  const out = run({ all: () => [null, {}, { json: null }, { json: [] }] });
  assert.equal(out.length, 4);
  for (const o of out) { assertDenied(o.json); assert.equal(o.json.scope_match, false); }
});

test('malformed quantities and reversed intervals fail closed', () => {
  const big = '0x' + 'f'.repeat(65);
  const bad = [
    '0x010', '0x00', '-0x10', '-16', '16', '0x1.5', '1.5', '0x', '0X10', '0x1F', '0xzz', '0x 10', ' 0x10', '', big,
  ];
  for (const v of bad) {
    for (const key of ['fromBlock', 'toBlock']) {
      const r = one(withFilter({ [key]: v }));
      assertDenied(r);
      assert.equal(r.scope_match, false, `${key}=${JSON.stringify(v)}`);
      assert.equal(r.covers_requested_interval, false);
      assert.ok(r.reasons.includes('invalid_block_interval'));
    }
  }
  const rev = one(withFilter({ fromBlock: '0x1f', toBlock: '0x10' }));
  assertDenied(rev);
  assert.equal(rev.scope_match, false);
  assert.ok(rev.reasons.includes('invalid_block_interval'));
});

test('valid intervals outside approved scope are out of scope', () => {
  for (const [f, t] of [['0xf', '0x1f'], ['0x10', '0x20'], ['0x0', '0x5'], ['0x20', '0x30']]) {
    const r = one(withFilter({ fromBlock: f, toBlock: t }));
    assertDenied(r);
    assert.equal(r.scope_match, false);
    assert.equal(r.covers_requested_interval, false);
    assert.ok(r.reasons.includes('proposal_outside_approved_scope'));
  }
});

test('wide integer precision boundary is not collapsed', () => {
  // 2^53 and 2^53+1 differ only under BigInt; both must stay out of scope.
  const max256 = '0x' + 'f'.repeat(64);
  for (const [f, t] of [
    ['0x20000000000000', '0x20000000000001'],
    ['0x10', '0x20000000000001'],
    ['0x10', max256],
    [max256, max256],
  ]) {
    const r = one(withFilter({ fromBlock: f, toBlock: t }));
    assertDenied(r);
    assert.equal(r.scope_match, false);
    assert.equal(r.covers_requested_interval, false);
  }
});

test('items are handled independently', () => {
  const [exact, bad, narrowed, injected] = exec(
    { proposal: fixtures.cases[1].input.proposal },
    { proposal: null },
    { proposal: fixtures.cases[0].input.proposal },
    { proposal: base(), approved: { maxCalls: 9 } },
  );
  assert.deepEqual(exact, fixtures.cases[1].expected);
  assert.equal(bad.scope_match, false);
  assert.deepEqual(narrowed, fixtures.cases[0].expected);
  assert.equal(injected.scope_match, false);
  for (const r of [exact, bad, narrowed, injected]) assertDenied(r);
  assert.equal(exec().length, 0);
});

test('receipt does not echo proposed fields', () => {
  const r = one(withFilter({ address: '0xdeadbeef' }));
  assert.ok(!JSON.stringify(r).includes('deadbeef'));
  assert.deepEqual(Object.keys(r).sort(), Object.keys(fixtures.cases[0].expected).sort());
});
