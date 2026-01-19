/**
 * 技能版本管理
 * 提供版本备份、回退和历史查询功能
 */

import * as path from 'path';
import * as fs from '../../utils/fs.js';
import * as paths from '../../utils/paths.js';
import * as markdown from '../../utils/markdown.js';
import type { Skill, SkillMetadata } from '../types.js';

/**
 * 版本元信息
 */
export interface VersionMeta {
  version: string;
  createdAt: string;
  reason?: string;
  previousVersion?: string;
  backupFile: string;
}

/**
 * 进化日志条目
 */
export interface EvolutionLogEntry {
  timestamp: string;
  fromVersion: string;
  toVersion: string;
  reason?: string;
  backupFile: string;
}

/**
 * 获取技能的备份目录路径
 */
export function getBackupDir(skillDir: string): string {
  return path.join(skillDir, '.backup');
}

/**
 * 获取技能的进化日志路径
 */
export function getEvolutionLogPath(skillDir: string): string {
  return path.join(paths.getSkillLogsDir(skillDir), 'evolution.log');
}

/**
 * 获取下一个备份文件名
 */
function getNextBackupFileName(backupDir: string): string {
  if (!fs.exists(backupDir)) {
    return 'SKILL.md.1';
  }
  
  const files = fs.listDir(backupDir);
  const backupFiles = files.filter(f => f.startsWith('SKILL.md.'));
  
  if (backupFiles.length === 0) {
    return 'SKILL.md.1';
  }
  
  const numbers = backupFiles
    .map(f => parseInt(f.replace('SKILL.md.', ''), 10))
    .filter(n => !isNaN(n));
  
  const maxNumber = Math.max(...numbers);
  return `SKILL.md.${maxNumber + 1}`;
}

/**
 * 创建版本备份
 */
export function createVersionBackup(
  skill: Skill,
  reason?: string
): VersionMeta | null {
  const backupDir = getBackupDir(skill.path);
  const skillMdPath = paths.getSkillMdPath(skill.path);
  
  // 确保备份目录存在
  fs.ensureDir(backupDir);
  
  // 获取当前内容
  if (!fs.exists(skillMdPath)) {
    return null;
  }
  
  const currentContent = fs.readFile(skillMdPath);
  const currentVersion = skill.metadata.version || '0.0.0';
  
  // 生成备份文件名
  const backupFileName = getNextBackupFileName(backupDir);
  const backupFilePath = path.join(backupDir, backupFileName);
  
  // 写入备份文件
  fs.writeFile(backupFilePath, currentContent);
  
  // 创建版本元信息
  const versionMeta: VersionMeta = {
    version: currentVersion,
    createdAt: new Date().toISOString(),
    reason,
    backupFile: backupFileName,
  };
  
  // 写入元信息文件
  const metaFilePath = path.join(backupDir, `${backupFileName}.meta.json`);
  fs.writeFile(metaFilePath, JSON.stringify(versionMeta, null, 2));
  
  return versionMeta;
}

/**
 * 记录进化日志
 */
export function logEvolution(
  skill: Skill,
  fromVersion: string,
  toVersion: string,
  reason?: string,
  backupFile?: string
): void {
  const logsDir = paths.getSkillLogsDir(skill.path);
  const logPath = getEvolutionLogPath(skill.path);
  
  // 确保日志目录存在
  fs.ensureDir(logsDir);
  
  const timestamp = new Date().toISOString();
  const logEntry = [
    `[${timestamp}] version: ${fromVersion} -> ${toVersion}`,
    reason ? `  reason: ${reason}` : null,
    backupFile ? `  backup: .backup/${backupFile}` : null,
    '', // 空行分隔
  ].filter(Boolean).join('\n');
  
  // 追加到日志文件
  if (fs.exists(logPath)) {
    const existingContent = fs.readFile(logPath);
    fs.writeFile(logPath, existingContent + '\n' + logEntry);
  } else {
    fs.writeFile(logPath, logEntry);
  }
}

/**
 * 列出所有版本备份
 */
export function listVersions(skillDir: string): VersionMeta[] {
  const backupDir = getBackupDir(skillDir);
  
  if (!fs.exists(backupDir)) {
    return [];
  }
  
  const files = fs.listDir(backupDir);
  const metaFiles = files.filter(f => f.endsWith('.meta.json'));
  
  const versions: VersionMeta[] = [];
  
  for (const metaFile of metaFiles) {
    const metaPath = path.join(backupDir, metaFile);
    try {
      const content = fs.readFile(metaPath);
      const meta = JSON.parse(content) as VersionMeta;
      versions.push(meta);
    } catch {
      // 忽略解析错误
    }
  }
  
  // 按创建时间倒序排列
  versions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return versions;
}

/**
 * 从备份恢复技能
 */
export function restoreFromBackup(
  skillDir: string,
  backupFile: string
): { success: boolean; content?: string; metadata?: SkillMetadata; error?: string } {
  const backupDir = getBackupDir(skillDir);
  const backupPath = path.join(backupDir, backupFile);
  
  if (!fs.exists(backupPath)) {
    return { success: false, error: `备份文件 ${backupFile} 不存在` };
  }
  
  try {
    const content = fs.readFile(backupPath);
    const metadata = markdown.parseSkillMetadata(content);
    const { body } = markdown.parseFrontmatter(content);
    
    // 写入 SKILL.md
    const skillMdPath = paths.getSkillMdPath(skillDir);
    fs.writeFile(skillMdPath, content);
    
    return { success: true, content, metadata };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * 获取指定版本的备份
 */
export function getVersionBackup(
  skillDir: string,
  version: string
): { backupFile: string; content: string; metadata: SkillMetadata } | null {
  const versions = listVersions(skillDir);
  const targetVersion = versions.find(v => v.version === version);
  
  if (!targetVersion) {
    return null;
  }
  
  const backupDir = getBackupDir(skillDir);
  const backupPath = path.join(backupDir, targetVersion.backupFile);
  
  if (!fs.exists(backupPath)) {
    return null;
  }
  
  try {
    const content = fs.readFile(backupPath);
    const metadata = markdown.parseSkillMetadata(content);
    
    return {
      backupFile: targetVersion.backupFile,
      content,
      metadata,
    };
  } catch {
    return null;
  }
}

/**
 * 清理旧版本备份（保留最近 N 个）
 */
export function cleanupOldBackups(skillDir: string, keepCount: number = 10): number {
  const versions = listVersions(skillDir);
  
  if (versions.length <= keepCount) {
    return 0;
  }
  
  const backupDir = getBackupDir(skillDir);
  const toDelete = versions.slice(keepCount);
  let deletedCount = 0;
  
  for (const version of toDelete) {
    const backupPath = path.join(backupDir, version.backupFile);
    const metaPath = path.join(backupDir, `${version.backupFile}.meta.json`);
    
    try {
      if (fs.exists(backupPath)) {
        fs.removeFile(backupPath);
      }
      if (fs.exists(metaPath)) {
        fs.removeFile(metaPath);
      }
      deletedCount++;
    } catch {
      // 忽略删除错误
    }
  }
  
  return deletedCount;
}
