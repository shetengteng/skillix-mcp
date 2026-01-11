/**
 * 技能信息类型定义
 */

import type { SkillScope } from './scope.js';

/**
 * 技能信息
 */
export interface SkillInfo {
  name: string;
  description: string;
  version?: string;
  author?: string;
  tags?: string[];
  scope: SkillScope;
  path: string;
  source?: string;
}
