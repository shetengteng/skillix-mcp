/**
 * sx-skill 工具
 * 本地技能管理：list, read, create, update, delete
 */

import type { ToolResponse, SxSkillParams } from '../types.js';
import { handleList } from './list.js';
import { handleRead } from './read.js';
import { handleCreate } from './create.js';
import { handleUpdate } from './update.js';
import { handleDelete } from './delete.js';

// 导出子命令处理函数
export { handleList, handleRead, handleCreate, handleUpdate, handleDelete };

// 导出类型
export type { SxSkillParams };

/**
 * sx-skill 工具主入口
 */
export function sxSkill(params: SxSkillParams): ToolResponse {
  const { action } = params;
  
  switch (action) {
    case 'list':
      return handleList(params);
    case 'read':
      return handleRead(params);
    case 'create':
      return handleCreate(params);
    case 'update':
      return handleUpdate(params);
    case 'delete':
      return handleDelete(params);
    default:
      return {
        success: false,
        message: `未知操作: ${action}`,
        errors: [`支持的操作: list, read, create, update, delete`],
      };
  }
}

/**
 * 工具定义（用于 MCP 注册）
 * 
 * AI First 设计说明：
 * - create 操作采用 AI First 模式
 * - AI 代理应先通过对话收集用户需求，再调用此工具
 * - 详见 sx-help topic=skill 获取完整引导流程
 */
export const sxSkillDefinition = {
  name: 'sx-skill',
  description: `本地技能管理工具，支持列出、读取、创建、更新、删除技能。

【AI First 创建模式】
创建技能时，若用户需求模糊，请先通过对话引导收集信息，再调用 create。
详细引导流程请调用: sx-help topic=skill

【技能命名】hyphen-case 格式，如 pdf-converter`,
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
        description: '技能名称（hyphen-case 格式，如 pdf-converter）',
      },
      scope: {
        type: 'string',
        enum: ['global', 'project'],
        description: '技能范围（默认 global）',
      },
      projectRoot: {
        type: 'string',
        description: '项目根目录路径（项目级操作时需要）',
      },
      metadata: {
        type: 'object',
        description: '技能元数据',
        properties: {
          name: { type: 'string', description: '技能名称' },
          description: { 
            type: 'string', 
            description: '技能描述（包含触发场景，如"当用户需要...时使用"）' 
          },
          version: { type: 'string', description: '版本号（默认 1.0.0）' },
          author: { type: 'string', description: '作者' },
          tags: { type: 'array', items: { type: 'string' }, description: '标签' },
        },
      },
      body: {
        type: 'string',
        description: 'SKILL.md 正文内容（Markdown 格式，包含使用说明、步骤、示例等）',
      },
    },
    required: ['action'],
  },
  handler: (args: any): ToolResponse => sxSkill(args as SxSkillParams),
};
