import { runBridge } from '../src/bridge.js';
await runBridge({ endpoint: process.env.TEST_ENDPOINT });
