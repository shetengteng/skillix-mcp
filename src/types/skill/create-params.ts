/**
 * 技能创建参数类型定义
 */

import type { SkillScope } from './scope.js';

/**
 * 技能创建参数
 */
export interface CreateSkillParams {
  name: string;
  description: string;
  content: string;
  scope?: SkillScope;
  version?: string;
  author?: string;
  tags?: string[];
}
