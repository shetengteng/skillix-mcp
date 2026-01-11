/**
 * 搜索技能
 */

import type { ListedSkill } from './types.js';
import { listAllSkills } from './list.js';

/**
 * 搜索技能
 */
export function searchSkills(
  query: string,
  projectRoot?: string
): ListedSkill[] {
  const { global_skills, project_skills } = listAllSkills(projectRoot);
  const allSkills = [...project_skills, ...global_skills];
  
  const lowerQuery = query.toLowerCase();
  
  return allSkills.filter(skill => 
    skill.name.toLowerCase().includes(lowerQuery) ||
    skill.description.toLowerCase().includes(lowerQuery)
  );
}
