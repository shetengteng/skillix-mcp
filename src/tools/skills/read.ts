/**
 * sx-skill read 子命令
 * 读取技能内容
 */

import type { ToolResponse, SxSkillParams } from '../types.js';
import { skillService } from '../../services/index.js';
import { success, error, errorFromException } from '../../utils/response.js';

/**
 * 读取技能
 */
export function handleRead(params: SxSkillParams): ToolResponse {
  const { name, projectRoot } = params;
  
  if (!name) {
    return error({
      message: '缺少技能名称',
      errors: ['参数 name 是必需的'],
    });
  }
  
  try {
    const content = skillService.readSkillContent(name, projectRoot);
    
    if (!content) {
      return error({
        message: `技能 "${name}" 不存在`,
        errors: [`未找到名为 "${name}" 的技能`],
      });
    }
    
    return success({
      message: `成功读取技能 "${name}"`,
      data: content,
    });
  } catch (e) {
    return errorFromException(`读取技能 "${name}" 失败`, e);
  }
}
