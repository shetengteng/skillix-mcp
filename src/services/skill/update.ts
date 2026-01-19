/**
 * 更新技能
 */

import type { Skill, SkillMetadata } from '../types.js';
import * as paths from '../../utils/paths.js';
import * as fs from '../../utils/fs.js';
import * as markdown from '../../utils/markdown.js';
import { getSkill } from './get.js';
import { createVersionBackup, logEvolution } from './version.js';
import type { VersionMeta } from './version.js';

/**
 * 更新选项
 */
export interface UpdateOptions {
  /** 项目根目录 */
  projectRoot?: string;
  /** 是否创建备份（默认 true） */
  createBackup?: boolean;
  /** 更新原因（用于日志记录） */
  reason?: string;
}

/**
 * 更新结果
 */
export interface UpdateResult {
  /** 更新后的技能 */
  skill: Skill;
  /** 备份信息（如果创建了备份） */
  backup?: VersionMeta;
}

/**
 * 更新技能
 */
export function updateSkill(
  skillName: string,
  updates: {
    metadata?: Partial<SkillMetadata>;
    body?: string;
  },
  projectRootOrOptions?: string | UpdateOptions
): Skill | null {
  // 兼容旧的 API（第三个参数为 projectRoot 字符串）
  const options: UpdateOptions = typeof projectRootOrOptions === 'string'
    ? { projectRoot: projectRootOrOptions }
    : projectRootOrOptions || {};
  
  const { projectRoot, createBackup = true, reason } = options;
  
  const skill = getSkill(skillName, projectRoot);
  
  if (!skill) {
    return null;
  }
  
  const oldVersion = skill.metadata.version || '0.0.0';
  
  // 创建备份（如果启用）
  let backupMeta: VersionMeta | null = null;
  if (createBackup) {
    backupMeta = createVersionBackup(skill, reason);
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
  
  const newVersion = newMetadata.version || '0.0.0';
  
  // 记录进化日志
  if (backupMeta) {
    logEvolution(skill, oldVersion, newVersion, reason, backupMeta.backupFile);
  }
  
  return {
    ...skill,
    name: newMetadata.name || skill.name,
    description: newMetadata.description || skill.description,
    metadata: newMetadata,
    content: newContent,
  };
}

/**
 * 更新技能（带详细结果）
 */
export function updateSkillWithResult(
  skillName: string,
  updates: {
    metadata?: Partial<SkillMetadata>;
    body?: string;
  },
  options?: UpdateOptions
): UpdateResult | null {
  const { projectRoot, createBackup = true, reason } = options || {};
  
  const skill = getSkill(skillName, projectRoot);
  
  if (!skill) {
    return null;
  }
  
  const oldVersion = skill.metadata.version || '0.0.0';
  
  // 创建备份（如果启用）
  let backupMeta: VersionMeta | null = null;
  if (createBackup) {
    backupMeta = createVersionBackup(skill, reason);
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
  
  const newVersion = newMetadata.version || '0.0.0';
  
  // 记录进化日志
  if (backupMeta) {
    logEvolution(skill, oldVersion, newVersion, reason, backupMeta.backupFile);
  }
  
  const updatedSkill: Skill = {
    ...skill,
    name: newMetadata.name || skill.name,
    description: newMetadata.description || skill.description,
    metadata: newMetadata,
    content: newContent,
  };
  
  return {
    skill: updatedSkill,
    backup: backupMeta || undefined,
  };
}
