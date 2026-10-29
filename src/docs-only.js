const tools = new Set(['search_docs', 'read_doc']);
const methods = new Set(['initialize', 'ping', 'tools/list', 'tools/call']);
const instructions = 'Use search_docs and read_doc to look up documentation. This connection exposes no RPC, account or transaction tools.';

export function createDocsOnlyPolicy({ local, remote, fail }) {
  const pending = new Map();
  const error = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });
  return {
    toServer(message) {
      if (!('method' in message)) return;
      if (!('id' in message)) {
        if (message.method === 'notifications/cancelled') pending.delete(message.params?.requestId);
        if (['notifications/initialized', 'notifications/cancelled'].includes(message.method)) return message;
        return;
      }
      if (!methods.has(message.method)) {
        local(error(message.id, -32601, 'Method unavailable on this documentation connection.'));
        return;
      }
      if (message.method === 'tools/call' && !tools.has(message.params?.name)) {
        local(error(message.id, -32602, 'Only search_docs and read_doc are available.'));
        return;
      }
      if (pending.size >= 64 || pending.has(message.id)) {
        local(error(message.id, -32600, 'Too many pending requests or duplicate request ID.'));
        return;
      }
      pending.set(message.id, message.method);
      if (message.method === 'initialize') {
        return { ...message, params: { ...message.params, capabilities: {} } };
      }
      return message;
    },
    toClient(message) {
      if ('method' in message) {
        if ('id' in message) {
          remote(message.method === 'ping'
            ? { jsonrpc: '2.0', id: message.id, result: {} }
            : error(message.id, -32601, 'Client requests unavailable on this documentation connection.'));
          return;
        }
        return message.method === 'notifications/tools/list_changed' ? message : undefined;
      }
      const method = pending.get(message.id);
      pending.delete(message.id);
      if (!method) return;
      if ('error' in message) return message;
      if (method === 'initialize') {
        return { ...message, result: { ...message.result,
          capabilities: message.result?.capabilities?.tools ? { tools: message.result.capabilities.tools } : {},
          instructions,
        } };
      }
      if (method === 'tools/list') {
        if (!Array.isArray(message.result?.tools)) { fail(); return; }
        return { ...message, result: { ...message.result,
          tools: message.result.tools.filter(tool => tool && tools.has(tool.name)),
        } };
      }
      return message;
    },
  };
}
