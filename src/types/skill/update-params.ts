/**
 * 技能更新参数类型定义
 */

import type { SkillScope } from './scope.js';

/**
 * 技能更新参数
 */
export interface UpdateSkillParams {
  name: string;
  scope?: SkillScope;
  description?: string;
  content?: string;
  version?: string;
  tags?: string[];
}
