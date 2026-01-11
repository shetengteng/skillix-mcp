/**
 * 技能列表响应类型定义
 */

import type { ListedSkill } from './listed-skill.js';

/**
 * 技能列表响应
 */
export interface ListSkillsResponse {
  global_skills: ListedSkill[];
  project_skills: ListedSkill[];
}
