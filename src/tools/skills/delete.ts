/**
 * sx-skill delete 子命令
 * 删除技能
 */

import type { ToolResponse, SxSkillParams } from '../types.js';
import { skillService } from '../../services/index.js';
import { success, error, errorFromException } from '../../utils/response.js';

/**
 * 删除技能
 */
export function handleDelete(params: SxSkillParams): ToolResponse {
  const { name, projectRoot } = params;
  
  if (!name) {
    return error({
      message: '缺少技能名称',
      errors: ['参数 name 是必需的'],
    });
  }
  
  try {
    const deleted = skillService.deleteSkill(name, projectRoot);
    
    if (!deleted) {
      return error({
        message: `技能 "${name}" 不存在或删除失败`,
        errors: [`未找到名为 "${name}" 的技能`],
      });
    }
    
    return success({
      message: `成功删除技能 "${name}"`,
    });
  } catch (e) {
    return errorFromException(`删除技能 "${name}" 失败`, e);
  }
}
