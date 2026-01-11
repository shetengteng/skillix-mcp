/**
 * 获取技能
 * 获取技能详情
 */

import type { Skill } from './types.js';
import * as paths from '../../utils/paths.js';
import { loadSkillFromDir } from './load.js';

/**
 * 获取技能详情
 */
export function getSkill(skillName: string, projectRoot?: string): Skill | null {
  // 先查找项目级技能（本地优先）
  if (projectRoot) {
    const projectSkillsDir = paths.getProjectSkillsDir(projectRoot);
    const projectSkillDir = paths.getSkillDir(projectSkillsDir, skillName);
    const projectSkill = loadSkillFromDir(projectSkillDir, 'project');
    
    if (projectSkill) {
      return projectSkill;
    }
  }
  
  // 再查找全局技能
  const globalSkillsDir = paths.getGlobalSkillsDir();
  const globalSkillDir = paths.getSkillDir(globalSkillsDir, skillName);
  return loadSkillFromDir(globalSkillDir, 'global');
}
