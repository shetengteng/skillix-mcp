/**
 * sx_skill 工具
 * 本地技能管理：list, read, create, update, delete
 */

import type { ToolResponse, ListSkillsResponse } from '../types/response.js';
import type { SkillMetadata, SkillScope } from '../types/skill.js';
import { skillService } from '../services/index.js';

/**
 * sx_skill 工具参数
 */
export interface SxSkillParams {
  action: 'list' | 'read' | 'create' | 'update' | 'delete';
  name?: string;
  scope?: SkillScope;
  projectRoot?: string;
  metadata?: SkillMetadata;
  body?: string;
  query?: string;
}

/**
 * 列出技能
 */
function handleList(params: SxSkillParams): ToolResponse {
  const { projectRoot } = params;
  
  try {
    const result: ListSkillsResponse = skillService.listAllSkills(projectRoot);
    
    const totalCount = result.global_skills.length + result.project_skills.length;
    
    return {
      success: true,
      message: `找到 ${totalCount} 个技能（全局: ${result.global_skills.length}, 项目: ${result.project_skills.length}）`,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: '列出技能失败',
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * 读取技能
 */
function handleRead(params: SxSkillParams): ToolResponse {
  const { name, projectRoot } = params;
  
  if (!name) {
    return {
      success: false,
      message: '缺少技能名称',
      errors: ['参数 name 是必需的'],
    };
  }
  
  try {
    const content = skillService.readSkillContent(name, projectRoot);
    
    if (!content) {
      return {
        success: false,
        message: `技能 "${name}" 不存在`,
        errors: [`未找到名为 "${name}" 的技能`],
      };
    }
    
    return {
      success: true,
      message: `成功读取技能 "${name}"`,
      data: content,
    };
  } catch (error) {
    return {
      success: false,
      message: `读取技能 "${name}" 失败`,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * 创建技能
 */
function handleCreate(params: SxSkillParams): ToolResponse {
  const { name, scope = 'global', projectRoot, metadata, body = '' } = params;
  
  if (!name) {
    return {
      success: false,
      message: '缺少技能名称',
      errors: ['参数 name 是必需的'],
    };
  }
  
  if (!metadata) {
    return {
      success: false,
      message: '缺少技能元数据',
      errors: ['参数 metadata 是必需的'],
    };
  }
  
  if (scope === 'project' && !projectRoot) {
    return {
      success: false,
      message: '项目级技能需要指定项目根目录',
      errors: ['参数 projectRoot 是必需的'],
    };
  }
  
  // 检查技能是否已存在
  if (skillService.skillExists(name, projectRoot)) {
    return {
      success: false,
      message: `技能 "${name}" 已存在`,
      errors: [`名为 "${name}" 的技能已存在，请使用 update 操作或选择其他名称`],
    };
  }
  
  try {
    const skill = skillService.createSkill(name, metadata, body, scope, projectRoot);
    
    return {
      success: true,
      message: `成功创建技能 "${name}"`,
      data: {
        name: skill.name,
        scope: skill.scope,
        path: skill.path,
        metadata: skill.metadata,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `创建技能 "${name}" 失败`,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * 更新技能
 */
function handleUpdate(params: SxSkillParams): ToolResponse {
  const { name, projectRoot, metadata, body } = params;
  
  if (!name) {
    return {
      success: false,
      message: '缺少技能名称',
      errors: ['参数 name 是必需的'],
    };
  }
  
  if (!metadata && body === undefined) {
    return {
      success: false,
      message: '缺少更新内容',
      errors: ['至少需要提供 metadata 或 body 参数'],
    };
  }
  
  try {
    const skill = skillService.updateSkill(name, { metadata, body }, projectRoot);
    
    if (!skill) {
      return {
        success: false,
        message: `技能 "${name}" 不存在`,
        errors: [`未找到名为 "${name}" 的技能`],
      };
    }
    
    return {
      success: true,
      message: `成功更新技能 "${name}"`,
      data: {
        name: skill.name,
        scope: skill.scope,
        path: skill.path,
        metadata: skill.metadata,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `更新技能 "${name}" 失败`,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * 删除技能
 */
function handleDelete(params: SxSkillParams): ToolResponse {
  const { name, projectRoot } = params;
  
  if (!name) {
    return {
      success: false,
      message: '缺少技能名称',
      errors: ['参数 name 是必需的'],
    };
  }
  
  try {
    const success = skillService.deleteSkill(name, projectRoot);
    
    if (!success) {
      return {
        success: false,
        message: `技能 "${name}" 不存在或删除失败`,
        errors: [`未找到名为 "${name}" 的技能`],
      };
    }
    
    return {
      success: true,
      message: `成功删除技能 "${name}"`,
    };
  } catch (error) {
    return {
      success: false,
      message: `删除技能 "${name}" 失败`,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * sx_skill 工具主入口
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
  name: 'sx_skill',
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
};
