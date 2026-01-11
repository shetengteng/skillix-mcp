/**
 * 检查技能是否存在
 */

import { getSkill } from './get.js';

/**
 * 检查技能是否存在
 */
export function skillExists(skillName: string, projectRoot?: string): boolean {
  return getSkill(skillName, projectRoot) !== null;
}
