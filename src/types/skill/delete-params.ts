/**
 * 技能删除参数类型定义
 */

import type { SkillScope } from './scope.js';

/**
 * 技能删除参数
 */
export interface DeleteSkillParams {
  name: string;
  scope?: SkillScope;
}
