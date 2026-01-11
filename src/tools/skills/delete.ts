/**
 * sx-skill delete 子命令
 * 删除技能
 */

import type { ToolResponse } from '../../types/response/tool.js';
import type { SxSkillParams } from '../types.js';
import { skillService } from '../../services/index.js';

/**
 * 删除技能
 */
export function handleDelete(params: SxSkillParams): ToolResponse {
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
