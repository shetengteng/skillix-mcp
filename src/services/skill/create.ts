/**
 * 创建技能
 */

import type { Skill } from '../../types/skill/skill.js';
import type { SkillMetadata } from '../../types/skill/metadata.js';
import type { SkillScope } from '../../types/skill/scope.js';
import * as paths from '../../utils/paths.js';
import * as fs from '../../utils/fs.js';
import * as markdown from '../../utils/markdown.js';

/**
 * 创建技能
 */
export function createSkill(
  skillName: string,
  metadata: SkillMetadata,
  body: string,
  scope: SkillScope,
  projectRoot?: string
): Skill {
  const skillsDir = scope === 'global'
    ? paths.getGlobalSkillsDir()
    : projectRoot
      ? paths.getProjectSkillsDir(projectRoot)
      : paths.getGlobalSkillsDir();
  
  const skillDir = paths.getSkillDir(skillsDir, skillName);
  
  // 确保目录存在
  fs.ensureDir(skillDir);
  fs.ensureDir(paths.getSkillScriptsDir(skillDir));
  fs.ensureDir(paths.getSkillReferencesDir(skillDir));
  fs.ensureDir(paths.getSkillAssetsDir(skillDir));
  fs.ensureDir(paths.getSkillLogsDir(skillDir));
  
  // 生成 SKILL.md 内容
  const content = markdown.generateSkillMd(metadata, body);
  const skillMdPath = paths.getSkillMdPath(skillDir);
  fs.writeFile(skillMdPath, content);
  
  return {
    name: skillName,
    description: metadata.description || '',
    scope,
    path: skillDir,
    metadata,
    content,
    hasScripts: true,
    hasReferences: true,
    hasAssets: true,
  };
}
