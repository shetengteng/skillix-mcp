/**
 * 技能列表过滤参数类型定义
 */

import type { SkillScope } from './scope.js';

/**
 * 技能列表过滤参数
 */
export interface ListSkillsParams {
  scope?: SkillScope | 'all';
}
