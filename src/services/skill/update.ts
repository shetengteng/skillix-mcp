/**
 * 更新技能
 */

import type { Skill } from '../../types/skill/skill.js';
import type { SkillMetadata } from '../../types/skill/metadata.js';
import * as paths from '../../utils/paths.js';
import * as fs from '../../utils/fs.js';
import * as markdown from '../../utils/markdown.js';
import { getSkill } from './get.js';

/**
 * 更新技能
 */
export function updateSkill(
  skillName: string,
  updates: {
    metadata?: Partial<SkillMetadata>;
    body?: string;
  },
  projectRoot?: string
): Skill | null {
  const skill = getSkill(skillName, projectRoot);
  
  if (!skill) {
    return null;
  }
  
  const { body: currentBody } = markdown.parseFrontmatter(skill.content || '');
  
  const newMetadata: SkillMetadata = {
    ...skill.metadata,
    ...updates.metadata,
  };
  
  const newBody = updates.body ?? currentBody;
  const newContent = markdown.generateSkillMd(newMetadata, newBody);
  
  const skillMdPath = paths.getSkillMdPath(skill.path);
  fs.writeFile(skillMdPath, newContent);
  
  return {
    ...skill,
    description: newMetadata.description || skill.description,
    metadata: newMetadata,
    content: newContent,
  };
}
