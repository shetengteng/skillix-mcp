/**
 * sx-skill list 子命令
 * 列出所有技能
 */

import type { ToolResponse } from '../../types/response/tool.js';
import type { ListSkillsResponse } from '../../types/response/list-skills.js';
import type { SxSkillParams } from '../../types/tools/sx-skill-params.js';
import { skillService } from '../../services/index.js';

/**
 * 列出技能
 */
export function handleList(params: SxSkillParams): ToolResponse {
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
