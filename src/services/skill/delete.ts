/**
 * 删除技能
 */

import * as fs from '../../utils/fs.js';
import { getSkill } from './get.js';

/**
 * 删除技能
 */
export function deleteSkill(skillName: string, projectRoot?: string): boolean {
  const skill = getSkill(skillName, projectRoot);
  
  if (!skill) {
    return false;
  }
  
  return fs.removeDir(skill.path);
}
