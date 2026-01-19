/**
 * Git 操作服务
 * 处理仓库克隆、拉取等操作
 */

import { execSync } from 'child_process';
import * as path from 'path';
import { exists, ensureDir, removeDir } from '../../utils/fs.js';
import { getRepoCacheDir, getReposCacheDir } from './paths.js';
import { parseGitUrl } from './url.js';
import type { SkillSource } from '../types.js';

/**
 * Git 操作选项
 */
export interface GitOptions {
  /** 克隆深度（默认 1） */
  depth?: number;
  /** 超时时间（毫秒，默认 60000） */
  timeout?: number;
  /** 是否使用 sparse-checkout（默认 true） */
  sparseCheckout?: boolean;
  /** 技能目录路径（默认 skills） */
  skillsPath?: string;
}

const DEFAULT_OPTIONS: GitOptions = {
  depth: 1,
  timeout: 60000,
  sparseCheckout: true,
  skillsPath: 'skills',
};

/**
 * 克隆仓库到缓存
 */
export function cloneRepo(source: SkillSource, options: GitOptions = {}): { success: boolean; error?: string; commit?: string } {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const parsed = parseGitUrl(source.url);
  
  if (!parsed) {
    return { success: false, error: `无效的 Git URL: ${source.url}` };
  }

  const repoDir = getRepoCacheDir(parsed.dirName);
  const branch = source.branch || 'main';

  // 如果已存在，先删除
  if (exists(repoDir)) {
    removeDir(repoDir);
  }

  // 确保父目录存在
  ensureDir(getReposCacheDir());

  try {
    // 构建克隆命令
    const cloneArgs = [
      'clone',
      '--depth', String(opts.depth),
      '--branch', branch,
      '--single-branch',
    ];

    // 使用 sparse-checkout 只检出 skills 目录
    if (opts.sparseCheckout) {
      cloneArgs.push('--filter=blob:none', '--sparse');
    }

    cloneArgs.push(source.url, repoDir);

    // 执行克隆
    execSync(`git ${cloneArgs.join(' ')}`, {
      timeout: opts.timeout,
      stdio: 'pipe',
    });

    // 设置 sparse-checkout
    if (opts.sparseCheckout) {
      execSync(`git sparse-checkout set ${opts.skillsPath}`, {
        cwd: repoDir,
        timeout: opts.timeout,
        stdio: 'pipe',
      });
    }

    // 获取当前 commit hash
    const commit = getCommitHash(repoDir);

    return { success: true, commit };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `克隆失败: ${errorMessage}` };
  }
}

/**
 * 拉取仓库更新
 */
export function pullRepo(dirName: string, options: GitOptions = {}): { success: boolean; error?: string; commit?: string; hasUpdates?: boolean } {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const repoDir = getRepoCacheDir(dirName);

  if (!exists(repoDir)) {
    return { success: false, error: '仓库不存在' };
  }

  try {
    // 获取更新前的 commit
    const beforeCommit = getCommitHash(repoDir);

    // 执行 fetch
    execSync('git fetch origin', {
      cwd: repoDir,
      timeout: opts.timeout,
      stdio: 'pipe',
    });

    // 检查是否有更新
    const localRef = execSync('git rev-parse HEAD', {
      cwd: repoDir,
      timeout: opts.timeout,
      encoding: 'utf-8',
    }).trim();

    const remoteRef = execSync('git rev-parse @{u}', {
      cwd: repoDir,
      timeout: opts.timeout,
      encoding: 'utf-8',
    }).trim();

    const hasUpdates = localRef !== remoteRef;

    if (hasUpdates) {
      // 执行 pull
      execSync('git pull --ff-only', {
        cwd: repoDir,
        timeout: opts.timeout,
        stdio: 'pipe',
      });
    }

    const afterCommit = getCommitHash(repoDir);

    return {
      success: true,
      commit: afterCommit,
      hasUpdates: beforeCommit !== afterCommit,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `拉取失败: ${errorMessage}` };
  }
}

/**
 * 获取仓库当前 commit hash
 */
export function getCommitHash(repoDir: string): string | undefined {
  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: repoDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    }).trim();
  } catch {
    return undefined;
  }
}

/**
 * 检查仓库是否存在
 */
export function repoExists(dirName: string): boolean {
  const repoDir = getRepoCacheDir(dirName);
  const gitDir = path.join(repoDir, '.git');
  return exists(gitDir);
}
