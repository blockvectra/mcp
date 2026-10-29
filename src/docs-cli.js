#!/usr/bin/env node
import { runBridge } from './bridge.js';

if (process.argv.length !== 2) {
  process.stderr.write('BlockVectra MCP：不接受命令行参数，请使用环境变量配置。\n');
  process.exitCode = 1;
} else {
  try {
    await runBridge({ docsOnly: true });
  } catch {
    process.stderr.write('BlockVectra MCP：启动失败。\n');
    process.exitCode = 1;
  }
}
