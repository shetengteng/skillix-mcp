/**
 * Skillix MCP Server 入口
 * 
 * 提供 AI 技能管理功能的 MCP 服务器
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { toolRegistry, getAvailableTools } from './tools/registry.js';

/**
 * 创建 MCP Server
 */
function createServer(): McpServer {
  const server = new McpServer({
    name: 'skillix-mcp',
    version: '1.0.0',
  });

  // 从注册表批量注册工具
  for (const tool of toolRegistry) {
    server.registerTool(tool.name, {
      description: tool.description,
      inputSchema: tool.schema,
    }, async (args) => {
      const result = tool.handler(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    });
  }

  return server;
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('Skillix MCP Server 已启动');
  console.error(`可用工具: ${getAvailableTools().join(', ')}`);
}

// 启动服务器
main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});
