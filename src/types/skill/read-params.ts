/**
 * 技能读取参数类型定义
 */

import type { SkillScope } from './scope.js';

/**
 * 技能读取参数
 */
export interface ReadSkillParams {
  name: string;
  scope?: SkillScope | 'auto';
}
