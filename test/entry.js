import { runBridge } from '../src/bridge.js';
await runBridge({ endpoint: process.env.TEST_ENDPOINT, docsOnly: process.env.TEST_DOCS_ONLY === '1' });
