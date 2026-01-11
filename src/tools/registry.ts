/**
 * 工具注册表
 * 
 * 统一管理所有 MCP 工具的配置和注册
 */

import { z } from 'zod';
import type { ToolResponse } from '../types/response/tool.js';
import { sxSkill, type SxSkillParams } from './skills/index.js';
import { sxConfig, type SxConfigParams } from './configs/index.js';
import { sxHelp, type SxHelpParams } from './helps/index.js';
import { buildToolSchemas } from './schema-builder.js';
import { toolSchemas } from './tool-schemas.js';

/**
 * 工具配置接口
 */
export interface ToolConfig {
  name: string;
  description: string;
  schema: z.ZodObject<any>;
  handler: (args: any) => ToolResponse;
}

/**
 * 工具处理函数映射
 */
const toolHandlers: Record<string, (args: any) => ToolResponse> = {
  'sx-skill': (args) => sxSkill(args as SxSkillParams),
  'sx-config': (args) => sxConfig(args as SxConfigParams),
  'sx-help': (args) => sxHelp(args as SxHelpParams),
};

/**
 * 从配置构建 Schema
 */
const builtSchemas = buildToolSchemas(toolSchemas);

/**
 * 工具注册表
 * 
 * 所有工具的配置集中在这里管理
 */
export const toolRegistry: ToolConfig[] = Array.from(builtSchemas.entries()).map(
  ([name, { description, schema }]) => ({
    name,
    description,
    schema,
    handler: toolHandlers[name],
  })
);

/**
 * 获取所有可用工具名称
 */
export function getAvailableTools(): string[] {
  return toolRegistry.map(tool => tool.name);
}
