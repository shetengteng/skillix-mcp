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
 */
export const sxSkillDefinition = {
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
  handler: (args: any): ToolResponse => sxSkill(args as SxSkillParams),
};
