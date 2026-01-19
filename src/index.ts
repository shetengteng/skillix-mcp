#!/usr/bin/env node
/**
 * Skillix MCP Server 入口
 * 
 * 提供 AI 技能管理功能的 MCP 服务器
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { toolDefinitions, getToolNames } from './tools/index.js';

/**
 * 创建 MCP Server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: 'skillix-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 处理工具列表请求
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: toolDefinitions.map(({ name, description, inputSchema }) => ({
      name,
      description,
      inputSchema,
    })),
  }));

  // 处理工具调用请求
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    const tool = toolDefinitions.find(t => t.name === name);
    
    if (!tool) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              message: `未知工具: ${name}`,
              errors: [`可用工具: ${getToolNames().join(', ')}`],
            }),
          },
        ],
      };
    }

    const result = tool.handler(args || {});
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  });

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
  console.error(`可用工具: ${getToolNames().join(', ')}`);
}

// 启动服务器
main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});
