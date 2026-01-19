/**
 * 安装/卸载服务
 * 处理技能的安装和卸载操作
 */

import * as path from 'path';
import { exists, copyDir, removeDir, readJson, writeJson, ensureDir } from '../../utils/fs.js';
import { getGlobalSkillsDir, getProjectSkillsDir, getSkillDir } from '../../utils/paths.js';
import { getCachedSkillDir, getGlobalInstalledPath, getProjectInstalledPath } from './paths.js';
import { findSkillByName } from './search.js';
import type { InstalledRecord, InstalledSkill, SkillScope } from '../types.js';

/**
 * 安装选项
 */
export interface InstallOptions {
  /** 技能名称 */
  name: string;
  /** 指定源名称 */
  source?: string;
  /** 安装范围 */
  scope?: SkillScope;
  /** 强制覆盖 */
  force?: boolean;
  /** 项目根目录 */
  projectRoot?: string;
}

/**
 * 安装结果
 */
export interface InstallResult {
  success: boolean;
  name: string;
  scope: SkillScope;
  path?: string;
  sourceId?: string;
  sourceName?: string;
  installedAt?: string;
  commit?: string;
  error?: string;
}

/**
 * 安装技能
 */
export function installSkill(options: InstallOptions): InstallResult {
  const { name, source, scope = 'global', force = false, projectRoot } = options;

  // 确定安装目录
  const skillsDir = scope === 'global' 
    ? getGlobalSkillsDir() 
    : getProjectSkillsDir(projectRoot || process.cwd());
  const targetDir = getSkillDir(skillsDir, name);

  // 检查是否已存在
  if (exists(targetDir) && !force) {
    return {
      success: false,
      name,
      scope,
      path: targetDir,
      error: `技能 "${name}" 已存在，使用 force=true 覆盖`,
    };
  }

  // 从缓存索引中查找技能
  const found = findSkillByName(name, source);
  if (!found) {
    return {
      success: false,
      name,
      scope,
      error: source 
        ? `在源 "${source}" 中未找到技能 "${name}"` 
        : `未找到技能 "${name}"`,
    };
  }

  // 获取缓存中的技能路径
  const cachedDir = getCachedSkillDir(found.dirName, name);
  if (!exists(cachedDir)) {
    return {
      success: false,
      name,
      scope,
      error: `缓存中未找到技能 "${name}"，请先执行 sync`,
    };
  }

  try {
    // 如果目标已存在且 force=true，先删除
    if (exists(targetDir)) {
      removeDir(targetDir);
    }

    // 确保父目录存在
    ensureDir(skillsDir);

    // 复制技能到安装目录
    copyDir(cachedDir, targetDir);

    const installedAt = new Date().toISOString();

    // 记录安装信息
    const installedSkill: InstalledSkill = {
      name,
      sourceId: found.sourceId,
      sourceName: found.sourceName,
      installedAt,
      updatedAt: installedAt,
      path: targetDir,
      commit: found.skill.version, // 使用版本作为标识
    };

    updateInstalledRecord(scope, projectRoot, installedSkill);

    return {
      success: true,
      name,
      scope,
      path: targetDir,
      sourceId: found.sourceId,
      sourceName: found.sourceName,
      installedAt,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      name,
      scope,
      error: `安装失败: ${errorMessage}`,
    };
  }
}

/**
 * 卸载选项
 */
export interface UninstallOptions {
  /** 技能名称 */
  name: string;
  /** 卸载范围 */
  scope?: SkillScope | 'auto';
  /** 项目根目录 */
  projectRoot?: string;
}

/**
 * 卸载结果
 */
export interface UninstallResult {
  success: boolean;
  name: string;
  scope: SkillScope;
  path?: string;
  uninstalledAt?: string;
  error?: string;
}

/**
 * 卸载技能
 */
export function uninstallSkill(options: UninstallOptions): UninstallResult {
  const { name, scope = 'auto', projectRoot } = options;

  // 确定技能位置
  let targetDir: string | null = null;
  let actualScope: SkillScope = 'global';

  if (scope === 'auto') {
    // 先查项目目录
    if (projectRoot) {
      const projectDir = getSkillDir(getProjectSkillsDir(projectRoot), name);
      if (exists(projectDir)) {
        targetDir = projectDir;
        actualScope = 'project';
      }
    }
    // 再查全局目录
    if (!targetDir) {
      const globalDir = getSkillDir(getGlobalSkillsDir(), name);
      if (exists(globalDir)) {
        targetDir = globalDir;
        actualScope = 'global';
      }
    }
  } else {
    const skillsDir = scope === 'global' 
      ? getGlobalSkillsDir() 
      : getProjectSkillsDir(projectRoot || process.cwd());
    const dir = getSkillDir(skillsDir, name);
    if (exists(dir)) {
      targetDir = dir;
      actualScope = scope;
    }
  }

  if (!targetDir) {
    return {
      success: false,
      name,
      scope: actualScope,
      error: `未找到技能 "${name}"`,
    };
  }

  try {
    // 删除技能目录
    removeDir(targetDir);

    const uninstalledAt = new Date().toISOString();

    // 从安装记录中移除
    removeFromInstalledRecord(actualScope, projectRoot, name);

    return {
      success: true,
      name,
      scope: actualScope,
      path: targetDir,
      uninstalledAt,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      name,
      scope: actualScope,
      error: `卸载失败: ${errorMessage}`,
    };
  }
}

/**
 * 更新安装记录
 */
function updateInstalledRecord(
  scope: SkillScope,
  projectRoot: string | undefined,
  skill: InstalledSkill
): void {
  const recordPath = scope === 'global' 
    ? getGlobalInstalledPath() 
    : getProjectInstalledPath(projectRoot || process.cwd());

  let record = readJson<InstalledRecord>(recordPath);
  
  if (!record) {
    record = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      skills: [],
    };
  }

  // 查找并更新或添加
  const existingIndex = record.skills.findIndex(s => s.name === skill.name);
  if (existingIndex >= 0) {
    record.skills[existingIndex] = {
      ...record.skills[existingIndex],
      ...skill,
      updatedAt: new Date().toISOString(),
    };
  } else {
    record.skills.push(skill);
  }

  record.updatedAt = new Date().toISOString();
  writeJson(recordPath, record);
}

/**
 * 从安装记录中移除
 */
function removeFromInstalledRecord(
  scope: SkillScope,
  projectRoot: string | undefined,
  skillName: string
): void {
  const recordPath = scope === 'global' 
    ? getGlobalInstalledPath() 
    : getProjectInstalledPath(projectRoot || process.cwd());

  const record = readJson<InstalledRecord>(recordPath);
  
  if (!record) {
    return;
  }

  record.skills = record.skills.filter(s => s.name !== skillName);
  record.updatedAt = new Date().toISOString();
  writeJson(recordPath, record);
}

/**
 * 获取安装记录
 */
export function getInstalledRecord(
  scope: SkillScope,
  projectRoot?: string
): InstalledRecord | null {
  const recordPath = scope === 'global' 
    ? getGlobalInstalledPath() 
    : getProjectInstalledPath(projectRoot || process.cwd());

  return readJson<InstalledRecord>(recordPath);
}

/**
 * 检查技能是否已安装
 */
export function isSkillInstalled(
  name: string,
  scope: SkillScope,
  projectRoot?: string
): boolean {
  const skillsDir = scope === 'global' 
    ? getGlobalSkillsDir() 
    : getProjectSkillsDir(projectRoot || process.cwd());
  const targetDir = getSkillDir(skillsDir, name);
  return exists(targetDir);
}
