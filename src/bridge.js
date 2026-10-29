import { StreamableHTTPClientTransport, isJSONRPCResponse, isJSONRPCResultResponse } from '@modelcontextprotocol/client';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createDocsOnlyPolicy } from './docs-only.js';

export const ENDPOINT = 'https://docs.blockvectra.com/mcp';

// endpoint 仅供库调用和本地测试；生产 CLI 始终使用 ENDPOINT。
export async function runBridge({ endpoint = ENDPOINT, apiKey = process.env.BLOCKVECTRA_API_KEY, docsOnly = false } = {}) {
  const http = new StreamableHTTPClientTransport(new URL(endpoint), {
    requestInit: apiKey && !docsOnly ? { headers: { 'x-api-key': apiKey } } : undefined,
  });
  const stdio = new StdioServerTransport();
  const initializeIds = new Set();
  let closing = false;
  let finish;
  const done = new Promise(resolve => { finish = resolve; });

  const close = async (failed = false) => {
    if (closing) return;
    closing = true;
    if (failed) {
      process.exitCode = 1;
      process.stderr.write('BlockVectra MCP：连接失败，桥接已关闭。\n');
    }
    process.off('SIGINT', onSignal);
    process.off('SIGTERM', onSignal);
    await Promise.allSettled([http.close(), stdio.close()]);
    finish();
  };
  const onSignal = () => { void close(); };
  const fail = () => { void close(true); };
  const policy = docsOnly ? createDocsOnlyPolicy({
    local: message => { void stdio.send(message).catch(fail); },
    remote: message => { void http.send(message).catch(fail); },
    fail,
  }) : undefined;
  http.onerror = stdio.onerror = fail;
  http.onclose = stdio.onclose = () => { void close(); };
  stdio.onmessage = message => {
    if (closing) return;
    if (policy) { message = policy.toServer(message); if (!message) return; }
    if (message.method === 'initialize' && 'id' in message) initializeIds.add(message.id);
    // 不等待请求响应，确保 SSE 双向请求的客户端回答可以立即发出。
    void http.send(message).catch(fail);
  };
  http.onmessage = message => {
    if (closing) return;
    if (isJSONRPCResponse(message) && initializeIds.delete(message.id)
      && isJSONRPCResultResponse(message) && typeof message.result.protocolVersion === 'string') {
      http.setProtocolVersion(message.result.protocolVersion);
    }
    if (policy) { message = policy.toClient(message); if (!message) return; }
    void stdio.send(message).catch(fail);
  };
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);
  try {
    await http.start();
    await stdio.start();
  } catch {
    await close(true);
  }
  await done;
}
