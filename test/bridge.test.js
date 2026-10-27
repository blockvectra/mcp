import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

// Synthetic per-run credential for header and reflected-secret redaction checks.
const secret = `test-only-${randomUUID()}`;
const rpc = (id, result) => ({ jsonrpc: '2.0', id, result });
const init = { jsonrpc: '2.0', id: 'init', method: 'initialize', params: {
  protocolVersion: '2025-11-25', capabilities: { sampling: {}, roots: { listChanged: true } },
  clientInfo: { name: 'original-client', version: '9' }, extra: { preserved: true },
} };
const initialized = { jsonrpc: '2.0', method: 'notifications/initialized' };
const result = { protocolVersion: '2025-03-26', capabilities: { tools: { listChanged: true }, sampling: {} },
  serverInfo: { name: 'original-server', version: '7' }, instructions: 'original instructions', extra: { kept: true } };

function child(t, entry, env = {}) {
  const proc = spawn(process.execPath, [fileURLToPath(new URL(entry, import.meta.url))], {
    env: { ...process.env, BLOCKVECTRA_API_KEY: '', ...env }, stdio: ['pipe', 'pipe', 'pipe'],
  });
  t.after(() => { if (proc.exitCode === null) proc.kill('SIGKILL'); });
  let stderr = '';
  let pending = '';
  const messages = [];
  proc.stderr.on('data', data => { stderr += data; });
  proc.stdout.on('data', data => {
    pending += data;
    let end;
    while ((end = pending.indexOf('\n')) >= 0) {
      messages.push(JSON.parse(pending.slice(0, end)));
      pending = pending.slice(end + 1);
      proc.emit('message-ready');
    }
  });
  const exited = once(proc, 'exit');
  return { proc, exited, stderr: () => stderr,
    send: message => proc.stdin.write(JSON.stringify(message) + '\n'),
    read: async () => {
      while (!messages.length) await once(proc, 'message-ready');
      return messages.shift();
    },
  };
}

for (const apiKey of ['', secret]) test(`原始双向桥接，header ${apiKey ? '有' : '无'}`, { timeout: 8000 }, async t => {
  const received = [];
  let sse;
  const server = createServer(async (req, res) => {
    assert.equal(req.headers['x-api-key'], apiKey || undefined);
    if (req.method === 'GET') {
      assert.equal(req.headers['mcp-protocol-version'], result.protocolVersion);
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      sse = res;
      res.write('data: ' + JSON.stringify({ jsonrpc: '2.0', method: 'notifications/tools/list_changed', params: { original: true } }) + '\n\n');
      res.write('data: ' + JSON.stringify({ jsonrpc: '2.0', id: 'server-request', method: 'roots/list', params: { original: true } }) + '\n\n');
      return;
    }
    let body = '';
    for await (const data of req) body += data;
    const message = JSON.parse(body);
    received.push(message);
    server.emit('received');
    if (message.method !== 'initialize') assert.equal(req.headers['mcp-protocol-version'], result.protocolVersion);
    if (!('method' in message) || !('id' in message)) { res.writeHead(202); res.end(); return; }
    res.writeHead(200, { 'content-type': 'application/json' });
    if (message.method === 'initialize') res.end(JSON.stringify(rpc(message.id, result)));
    else if (message.method === 'tools/list') res.end(JSON.stringify(rpc(message.id, { tools: [{ name: 'dynamic', inputSchema: { type: 'object' }, annotations: { readOnlyHint: true } }] })));
    else if (message.params.name === 'error') res.end(JSON.stringify({ jsonrpc: '2.0', id: message.id, error: { code: -32042, message: 'original error', data: { original: true } } }));
    else res.end(JSON.stringify(rpc(message.id, { content: [{ type: 'text', text: 'original tool result' }], structuredContent: { original: true }, isError: true })));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { sse?.destroy(); server.closeAllConnections(); server.close(); });
  const c = child(t, './entry.js', { TEST_ENDPOINT: `http://127.0.0.1:${server.address().port}/mcp`, BLOCKVECTRA_API_KEY: apiKey });
  c.send(init);
  assert.deepEqual(await c.read(), rpc('init', result));
  assert.deepEqual(received[0], init);
  c.send(initialized);
  assert.deepEqual(await c.read(), { jsonrpc: '2.0', method: 'notifications/tools/list_changed', params: { original: true } });
  assert.deepEqual(await c.read(), { jsonrpc: '2.0', id: 'server-request', method: 'roots/list', params: { original: true } });
  const answer = rpc('server-request', { roots: [{ uri: 'file:///original' }] });
  const notification = { jsonrpc: '2.0', method: 'notifications/roots/list_changed', params: { original: true } };
  c.send(answer); c.send(notification);
  c.send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: { original: true } });
  assert.deepEqual(await c.read(), rpc(2, { tools: [{ name: 'dynamic', inputSchema: { type: 'object' }, annotations: { readOnlyHint: true } }] }));
  for (const name of ['ok', 'error']) {
    c.send({ jsonrpc: '2.0', id: name, method: 'tools/call', params: { name, arguments: { original: true } } });
    assert.deepEqual(await c.read(), name === 'error'
      ? { jsonrpc: '2.0', id: name, error: { code: -32042, message: 'original error', data: { original: true } } }
      : rpc(name, { content: [{ type: 'text', text: 'original tool result' }], structuredContent: { original: true }, isError: true }));
  }
  while (!received.some(m => m.method === notification.method) || !received.some(m => m.id === answer.id)) await once(server, 'received');
  assert.deepEqual(received.find(m => m.id === answer.id), answer);
  assert.deepEqual(received.find(m => m.method === notification.method), notification);
  c.proc.stdin.end();
  assert.equal((await c.exited)[0], 0);
  assert.equal(c.stderr(), '');
});

test('initialize POST SSE 中同 ID 反向 ping 后仍协商版本，乱序响应保留 ID', { timeout: 8000 }, async t => {
  let initStream;
  const pending = new Map();
  let getSeen;
  const gotGet = new Promise(resolve => { getSeen = resolve; });
  const server = createServer(async (req, res) => {
    if (req.method === 'GET') {
      assert.equal(req.headers['mcp-protocol-version'], result.protocolVersion);
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      getSeen();
      return;
    }
    let body = '';
    for await (const data of req) body += data;
    const message = JSON.parse(body);
    if (message.method === 'initialize') {
      assert.deepEqual(message, init);
      initStream = res;
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      res.write('data: ' + JSON.stringify({ jsonrpc: '2.0', id: init.id, method: 'ping' }) + '\n\n');
    } else if (!('method' in message)) {
      assert.deepEqual(message, rpc(init.id, {}));
      res.writeHead(202); res.end();
      initStream.end('data: ' + JSON.stringify(rpc(init.id, result)) + '\n\n');
    } else {
      assert.equal(req.headers['mcp-protocol-version'], result.protocolVersion);
      if (message.method === 'tools/list') {
        pending.set(message.id, res);
        if (pending.size === 2) {
          for (const id of ['second', 'first']) {
            pending.get(id).writeHead(200, { 'content-type': 'application/json' });
            pending.get(id).end(JSON.stringify(rpc(id, { tools: [{ name: id }] })));
          }
        }
      } else { res.writeHead(202); res.end(); }
    }
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const c = child(t, './entry.js', { TEST_ENDPOINT: `http://127.0.0.1:${server.address().port}/mcp` });
  c.send(init);
  assert.deepEqual(await c.read(), { jsonrpc: '2.0', id: init.id, method: 'ping' });
  c.send(rpc(init.id, {}));
  assert.deepEqual(await c.read(), rpc(init.id, result));
  c.send(initialized);
  await gotGet;
  c.send({ jsonrpc: '2.0', id: 'first', method: 'tools/list' });
  c.send({ jsonrpc: '2.0', id: 'second', method: 'tools/list' });
  assert.deepEqual(await c.read(), rpc('second', { tools: [{ name: 'second' }] }));
  assert.deepEqual(await c.read(), rpc('first', { tools: [{ name: 'first' }] }));
  c.proc.stdin.end();
  assert.equal((await c.exited)[0], 0);
  assert.equal(c.stderr(), '');
});

test('HTTP 错误反射凭据仍只输出安全诊断并退出', { timeout: 5000 }, async t => {
  const server = createServer((req, res) => { res.writeHead(500); res.end(req.headers['x-api-key']); });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const c = child(t, './entry.js', { TEST_ENDPOINT: `http://127.0.0.1:${server.address().port}`, BLOCKVECTRA_API_KEY: secret });
  c.send(init);
  assert.equal((await c.exited)[0], 1);
  assert.equal(c.stderr(), 'BlockVectra MCP：连接失败，桥接已关闭。\n');
  assert.ok(!c.stderr().includes(secret));
});

for (const signal of ['SIGINT', 'SIGTERM']) test(`生产 CLI ${signal} 正常关闭`, { timeout: 5000 }, async t => {
  const c = child(t, '../src/cli.js');
  // 等待模块加载，避免信号落在 CLI 注册处理器之前。
  await new Promise(resolve => setTimeout(resolve, 500));
  c.proc.kill(signal);
  assert.deepEqual(await c.exited, [0, null]);
  assert.equal(c.stderr(), '');
});

test('生产 CLI EOF 正常退出', { timeout: 5000 }, async t => {
  const c = child(t, '../src/cli.js');
  c.proc.stdin.end();
  assert.equal((await c.exited)[0], 0);
  assert.equal(c.stderr(), '');
});

test('生产 CLI 拒绝参数且不回显', { timeout: 5000 }, async t => {
  const proc = spawn(process.execPath, [fileURLToPath(new URL('../src/cli.js', import.meta.url)), secret]);
  t.after(() => { if (proc.exitCode === null) proc.kill('SIGKILL'); });
  let stderr = ''; let stdout = '';
  proc.stderr.on('data', data => { stderr += data; });
  proc.stdout.on('data', data => { stdout += data; });
  assert.equal((await once(proc, 'exit'))[0], 1);
  assert.equal(stdout, '');
  assert.equal(stderr, 'BlockVectra MCP：不接受命令行参数，请使用环境变量配置。\n');
});

test('HTTP 请求未响应时 EOF 取消请求并退出', { timeout: 5000 }, async t => {
  const server = createServer(req => { req.resume(); server.emit('request-seen'); });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const c = child(t, './entry.js', { TEST_ENDPOINT: `http://127.0.0.1:${server.address().port}` });
  const seen = once(server, 'request-seen');
  c.send(init);
  await seen;
  c.proc.stdin.end();
  assert.equal((await c.exited)[0], 0);
  assert.equal(c.stderr(), '');
});
