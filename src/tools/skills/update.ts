/**
 * sx-skill update 子命令
 * 更新现有技能
 */

import type { ToolResponse } from '../../types/response/tool.js';
import type { SxSkillParams } from '../types.js';
import { skillService } from '../../services/index.js';

/**
 * 更新技能
 */
export function handleUpdate(params: SxSkillParams): ToolResponse {
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
