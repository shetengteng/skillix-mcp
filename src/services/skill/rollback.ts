/**
 * 技能回退
 * 从备份恢复技能到指定版本
 */

import type { Skill, SkillMetadata } from '../types.js';
import { getSkill } from './get.js';
import { 
  listVersions, 
  restoreFromBackup, 
  getVersionBackup,
  createVersionBackup,
  logEvolution,
  type VersionMeta 
} from './version.js';

/**
 * 回退选项
 */
export interface RollbackOptions {
  /** 项目根目录 */
  projectRoot?: string;
  /** 回退原因 */
  reason?: string;
  /** 是否在回退前备份当前版本（默认 true） */
  backupCurrent?: boolean;
}

/**
 * 回退结果
 */
export interface RollbackResult {
  success: boolean;
  skill?: Skill;
  fromVersion: string;
  toVersion: string;
  backup?: VersionMeta;
  error?: string;
}

/**
 * 回退到指定版本
 */
export function rollbackSkill(
  skillName: string,
  targetVersion: string,
  options?: RollbackOptions
): RollbackResult {
  const { projectRoot, reason, backupCurrent = true } = options || {};
  
  // 获取当前技能
  const skill = getSkill(skillName, projectRoot);
  
  if (!skill) {
    return {
      success: false,
      fromVersion: '',
      toVersion: targetVersion,
      error: `技能 "${skillName}" 不存在`,
    };
  }
  
  const currentVersion = skill.metadata.version || '0.0.0';
  
  // 获取目标版本的备份
  const targetBackup = getVersionBackup(skill.path, targetVersion);
  
  if (!targetBackup) {
    return {
      success: false,
      fromVersion: currentVersion,
      toVersion: targetVersion,
      error: `未找到版本 ${targetVersion} 的备份`,
    };
  }
  
  // 在回退前备份当前版本
  let currentBackup: VersionMeta | null = null;
  if (backupCurrent) {
    currentBackup = createVersionBackup(skill, `回退前备份 (${currentVersion} -> ${targetVersion})`);
  }
  
  // 恢复目标版本
  const restoreResult = restoreFromBackup(skill.path, targetBackup.backupFile);
  
  if (!restoreResult.success) {
    return {
      success: false,
      fromVersion: currentVersion,
      toVersion: targetVersion,
      error: restoreResult.error,
    };
  }
  
  // 记录进化日志
  const rollbackReason = reason || `回退到版本 ${targetVersion}`;
  logEvolution(
    skill, 
    currentVersion, 
    targetVersion, 
    rollbackReason,
    currentBackup?.backupFile
  );
  
  // 重新获取更新后的技能
  const updatedSkill = getSkill(skillName, projectRoot);
  
  return {
    success: true,
    skill: updatedSkill || undefined,
    fromVersion: currentVersion,
    toVersion: targetVersion,
    backup: currentBackup || undefined,
  };
}

/**
 * 回退到上一个版本
 */
export function rollbackToPrevious(
  skillName: string,
  options?: RollbackOptions
): RollbackResult {
  const { projectRoot } = options || {};
  
  // 获取当前技能
  const skill = getSkill(skillName, projectRoot);
  
  if (!skill) {
    return {
      success: false,
      fromVersion: '',
      toVersion: '',
      error: `技能 "${skillName}" 不存在`,
    };
  }
  
  // 获取版本列表
  const versions = listVersions(skill.path);
  
  if (versions.length === 0) {
    return {
      success: false,
      fromVersion: skill.metadata.version || '0.0.0',
      toVersion: '',
      error: '没有可用的备份版本',
    };
  }
  
  // 获取最近的备份版本
  const previousVersion = versions[0];
  
  return rollbackSkill(skillName, previousVersion.version, options);
}

/**
 * 获取技能的版本历史
 */
export function getVersionHistory(
  skillName: string,
  projectRoot?: string
): { currentVersion: string; versions: VersionMeta[] } | null {
  const skill = getSkill(skillName, projectRoot);
  
  if (!skill) {
    return null;
  }
  
  const versions = listVersions(skill.path);
  
  return {
    currentVersion: skill.metadata.version || '0.0.0',
    versions,
  };
}
