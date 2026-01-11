/**
 * sx-skill 工具参数类型定义
 */

import type { SkillMetadata } from '../skill/metadata.js';
import type { SkillScope } from '../skill/scope.js';

/**
 * sx-skill 工具参数
 */
export interface SxSkillParams {
  action: 'list' | 'read' | 'create' | 'update' | 'delete';
  name?: string;
  scope?: SkillScope;
  projectRoot?: string;
  metadata?: SkillMetadata;
  body?: string;
  query?: string;
}
