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
 * sx-skill 工具 schema
 */
const sxSkillSchema = z.object({
  action: z.enum(['list', 'read', 'create', 'update', 'delete']).describe('操作类型'),
  name: z.string().optional().describe('技能名称（read/create/update/delete 时必需）'),
  scope: z.enum(['global', 'project']).optional().describe('技能范围（create 时使用，默认 global）'),
  projectRoot: z.string().optional().describe('项目根目录路径（项目级操作时需要）'),
  metadata: z.object({
    name: z.string(),
    description: z.string(),
    version: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional().describe('技能元数据（create/update 时使用）'),
  body: z.string().optional().describe('SKILL.md 正文内容（create/update 时使用）'),
});

/**
 * sx-config 工具 schema
 */
const sxConfigSchema = z.object({
  action: z.enum(['get', 'set', 'init', 'sources']).describe('操作类型'),
  scope: z.enum(['global', 'project']).optional().describe('配置范围（默认 global）'),
  projectRoot: z.string().optional().describe('项目根目录路径（项目级操作时需要）'),
  key: z.string().optional().describe('配置键（get/set 时使用）'),
  value: z.any().optional().describe('配置值（set 时使用）'),
  sourceAction: z.enum(['list', 'add', 'remove']).optional().describe('源操作类型（sources 时使用）'),
  source: z.object({
    name: z.string(),
    url: z.string(),
    branch: z.string().optional(),
    default: z.boolean().optional(),
  }).optional().describe('技能源配置（sources add 时使用）'),
  sourceName: z.string().optional().describe('技能源名称（sources remove 时使用）'),
});

/**
 * sx-help 工具 schema
 */
const sxHelpSchema = z.object({
  topic: z.enum(['overview', 'skill', 'config', 'market', 'triage', 'all']).optional().describe('帮助主题（默认 overview）'),
});

/**
 * 工具注册表
 * 
 * 所有工具的配置集中在这里管理
 */
export const toolRegistry: ToolConfig[] = [
  {
    name: 'sx-skill',
    description: '本地技能管理工具，支持列出、读取、创建、更新、删除技能',
    schema: sxSkillSchema,
    handler: (args) => sxSkill(args as SxSkillParams),
  },
  {
    name: 'sx-config',
    description: '配置管理工具，支持获取、设置配置和管理技能源',
    schema: sxConfigSchema,
    handler: (args) => sxConfig(args as SxConfigParams),
  },
  {
    name: 'sx-help',
    description: '帮助信息工具，提供 Skillix 使用指南',
    schema: sxHelpSchema,
    handler: (args) => sxHelp(args as SxHelpParams),
  },
];

/**
 * 获取所有可用工具名称
 */
export function getAvailableTools(): string[] {
  return toolRegistry.map(tool => tool.name);
}
