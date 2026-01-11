/**
 * sx-skill create 子命令
 * 创建新技能
 */

import type { ToolResponse } from '../../types/response/tool.js';
import type { SxSkillParams } from '../types.js';
import { skillService } from '../../services/index.js';

/**
 * 创建技能
 */
export function handleCreate(params: SxSkillParams): ToolResponse {
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
