/**
 * 技能完整内容类型定义
 */

import type { SkillInfo } from './info.js';
import type { SkillMetadata } from './metadata.js';

/**
 * 技能完整内容
 */
export interface Skill extends SkillInfo {
  content: string;
  metadata: SkillMetadata;
  hasScripts: boolean;
  hasReferences: boolean;
  hasAssets: boolean;
}
