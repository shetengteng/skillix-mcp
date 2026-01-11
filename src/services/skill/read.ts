/**
 * 读取技能内容
 */

import type { SkillMetadata } from '../../types/skill/metadata.js';
import * as paths from '../../utils/paths.js';
import * as fs from '../../utils/fs.js';
import * as markdown from '../../utils/markdown.js';
import { getSkill } from './get.js';

/**
 * 读取技能内容
 */
export function readSkillContent(skillName: string, projectRoot?: string): {
  metadata: SkillMetadata;
  body: string;
  scripts?: string[];
  references?: string[];
  assets?: string[];
} | null {
  const skill = getSkill(skillName, projectRoot);
  
  if (!skill || !skill.content) {
    return null;
  }
  
  const { body } = markdown.parseFrontmatter(skill.content);
  
  // 获取附加资源
  const scriptsDir = paths.getSkillScriptsDir(skill.path);
  const referencesDir = paths.getSkillReferencesDir(skill.path);
  const assetsDir = paths.getSkillAssetsDir(skill.path);
  
  return {
    metadata: skill.metadata,
    body,
    scripts: fs.exists(scriptsDir) ? fs.listDir(scriptsDir) : undefined,
    references: fs.exists(referencesDir) ? fs.listDir(referencesDir) : undefined,
    assets: fs.exists(assetsDir) ? fs.listDir(assetsDir) : undefined,
  };
}
