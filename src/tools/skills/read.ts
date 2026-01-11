/**
 * sx-skill read 子命令
 * 读取技能内容
 */

import type { ToolResponse } from '../../types/response/tool.js';
import type { SxSkillParams } from '../types.js';
import { skillService } from '../../services/index.js';

/**
 * 读取技能
 */
export function handleRead(params: SxSkillParams): ToolResponse {
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
