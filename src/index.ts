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

import type { ToolResponse } from './types/response/tool.js';
import { sxSkill, type SxSkillParams } from './tools/skills/index.js';
import { sxConfig, type SxConfigParams } from './tools/configs/index.js';
import { sxHelp, type SxHelpParams } from './tools/helps/index.js';

/**
 * JSON Schema 类型定义
 */
interface JsonSchema {
  type: 'object';
  properties?: Record<string, {
    type?: string;
    enum?: string[];
    description?: string;
    items?: { type: string };
    properties?: Record<string, any>;
  }>;
  required?: string[];
}

/**
 * 工具配置接口
 */
interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  handler: (args: any) => ToolResponse;
}

/**
 * 工具配置列表
 */
const toolDefinitions: ToolDefinition[] = [
  {
    name: 'sx-skill',
    description: '本地技能管理工具，支持列出、读取、创建、更新、删除技能',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'read', 'create', 'update', 'delete'],
          description: '操作类型',
        },
        name: {
          type: 'string',
          description: '技能名称（read/create/update/delete 时必需）',
        },
        scope: {
          type: 'string',
          enum: ['global', 'project'],
          description: '技能范围（create 时使用，默认 global）',
        },
        projectRoot: {
          type: 'string',
          description: '项目根目录路径（项目级操作时需要）',
        },
        metadata: {
          type: 'object',
          description: '技能元数据（create/update 时使用）',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            version: { type: 'string' },
            author: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
        body: {
          type: 'string',
          description: 'SKILL.md 正文内容（create/update 时使用）',
        },
      },
      required: ['action'],
    },
    handler: (args) => sxSkill(args as SxSkillParams),
  },
  {
    name: 'sx-config',
    description: '配置管理工具，支持获取、设置配置和管理技能源',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['get', 'set', 'init', 'sources'],
          description: '操作类型',
        },
        scope: {
          type: 'string',
          enum: ['global', 'project'],
          description: '配置范围（默认 global）',
        },
        projectRoot: {
          type: 'string',
          description: '项目根目录路径（项目级操作时需要）',
        },
        key: {
          type: 'string',
          description: '配置键（get/set 时使用）',
        },
        value: {
          description: '配置值（set 时使用）',
        },
        sourceAction: {
          type: 'string',
          enum: ['list', 'add', 'remove'],
          description: '源操作类型（sources 时使用）',
        },
        source: {
          type: 'object',
          description: '技能源配置（sources add 时使用）',
          properties: {
            name: { type: 'string' },
            url: { type: 'string' },
            branch: { type: 'string' },
            default: { type: 'boolean' },
          },
        },
        sourceName: {
          type: 'string',
          description: '技能源名称（sources remove 时使用）',
        },
      },
      required: ['action'],
    },
    handler: (args) => sxConfig(args as SxConfigParams),
  },
  {
    name: 'sx-help',
    description: '帮助信息工具，提供 Skillix 使用指南',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          enum: ['overview', 'skill', 'config', 'market', 'triage', 'all'],
          description: '帮助主题（默认 overview）',
        },
      },
    },
    handler: (args) => sxHelp(args as SxHelpParams),
  },
];

/**
 * 获取所有可用工具名称
 */
function getToolNames(): string[] {
  return toolDefinitions.map(t => t.name);
}

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
