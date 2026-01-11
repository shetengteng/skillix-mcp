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

import {
  sxSkill,
  sxSkillDefinition,
  sxConfig,
  sxConfigDefinition,
  sxHelp,
  sxHelpDefinition,
  type SxSkillParams,
  type SxConfigParams,
  type SxHelpParams,
} from './tools/index.js';

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

  // 注册工具列表处理器
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        sxSkillDefinition,
        sxConfigDefinition,
        sxHelpDefinition,
      ],
    };
  });

  // 注册工具调用处理器
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result;

      switch (name) {
        case 'sx_skill':
          result = sxSkill(args as unknown as SxSkillParams);
          break;
        case 'sx_config':
          result = sxConfig(args as unknown as SxConfigParams);
          break;
        case 'sx_help':
          result = sxHelp(args as unknown as SxHelpParams);
          break;
        default:
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: `未知工具: ${name}`,
                  errors: ['可用工具: sx_skill, sx_config, sx_help'],
                }),
              },
            ],
          };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              message: '工具执行失败',
              errors: [error instanceof Error ? error.message : String(error)],
            }),
          },
        ],
        isError: true,
      };
    }
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
}

// 启动服务器
main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});
