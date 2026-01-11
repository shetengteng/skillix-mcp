/**
 * 技能加载
 * 从目录加载技能
 */

import type { Skill, SkillScope } from '../types.js';
import * as paths from '../../utils/paths.js';
import * as fs from '../../utils/fs.js';
import * as markdown from '../../utils/markdown.js';

/**
 * 从目录加载技能
 */
export function loadSkillFromDir(skillDir: string, scope: SkillScope): Skill | null {
  const skillMdPath = paths.getSkillMdPath(skillDir);
  
  if (!fs.exists(skillMdPath)) {
    return null;
  }
  
  try {
    const content = fs.readFile(skillMdPath);
    const metadata = markdown.parseSkillMetadata(content);
    const skillName = metadata.name || skillDir.split('/').pop() || '';
    
    return {
      name: skillName,
      description: metadata.description || '',
      scope,
      path: skillDir,
      metadata,
      content,
      hasScripts: fs.exists(paths.getSkillScriptsDir(skillDir)),
      hasReferences: fs.exists(paths.getSkillReferencesDir(skillDir)),
      hasAssets: fs.exists(paths.getSkillAssetsDir(skillDir)),
    };
  } catch {
    return null;
  }
}
