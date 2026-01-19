/**
 * sx-skill list 子命令
 * 列出所有技能
 */

import type { ToolResponse, SxSkillParams } from '../types.js';
import type { ListSkillsResponse } from '../../services/types.js';
import { skillService } from '../../services/index.js';
import { success, errorFromException } from '../../utils/response.js';

/**
 * 列出技能
 */
export function handleList(params: SxSkillParams): ToolResponse {
  const { projectRoot } = params;
  
  try {
    const result: ListSkillsResponse = skillService.listAllSkills(projectRoot);
    
    const totalCount = result.global_skills.length + result.project_skills.length;
    
    return success({
      message: `找到 ${totalCount} 个技能（全局: ${result.global_skills.length}, 项目: ${result.project_skills.length}）`,
      data: result,
    });
  } catch (e) {
    return errorFromException('列出技能失败', e);
  }
}
