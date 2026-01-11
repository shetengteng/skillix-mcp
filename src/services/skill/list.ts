/**
 * 技能列表
 * 列出全局/项目/所有技能
 */

import type { Skill, ListedSkill, ListSkillsResponse } from '../types.js';
import * as paths from '../../utils/paths.js';
import * as fs from '../../utils/fs.js';
import { loadSkillFromDir } from './load.js';

/**
 * 列出全局技能
 */
export function listGlobalSkills(): Skill[] {
  const skillsDir = paths.getGlobalSkillsDir();
  
  if (!fs.exists(skillsDir)) {
    return [];
  }
  
  const skills: Skill[] = [];
  const dirs = fs.listSubDirs(skillsDir);
  
  for (const dir of dirs) {
    const skillDir = paths.getSkillDir(skillsDir, dir);
    const skill = loadSkillFromDir(skillDir, 'global');
    
    if (skill) {
      skills.push(skill);
    }
  }
  
  return skills;
}

/**
 * 列出项目技能
 */
export function listProjectSkills(projectRoot: string): Skill[] {
  const skillsDir = paths.getProjectSkillsDir(projectRoot);
  
  if (!fs.exists(skillsDir)) {
    return [];
  }
  
  const skills: Skill[] = [];
  const dirs = fs.listSubDirs(skillsDir);
  
  for (const dir of dirs) {
    const skillDir = paths.getSkillDir(skillsDir, dir);
    const skill = loadSkillFromDir(skillDir, 'project');
    
    if (skill) {
      skills.push(skill);
    }
  }
  
  return skills;
}

/**
 * 列出所有技能
 */
export function listAllSkills(projectRoot?: string): ListSkillsResponse {
  const globalSkills = listGlobalSkills();
  const projectSkills = projectRoot ? listProjectSkills(projectRoot) : [];
  
  const toListedSkill = (skill: Skill): ListedSkill => ({
    name: skill.metadata.name || skill.name,
    description: skill.metadata.description || '',
    source: skill.scope === 'global' ? 'global' : 'project',
    path: skill.path,
  });
  
  return {
    global_skills: globalSkills.map(toListedSkill),
    project_skills: projectSkills.map(toListedSkill),
  };
}
