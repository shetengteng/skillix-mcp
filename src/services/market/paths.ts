/**
 * Market 缓存路径工具
 * 处理缓存目录结构
 */

import * as path from 'path';
import { getGlobalCacheDir } from '../../utils/paths.js';

/**
 * 获取仓库缓存目录
 * ~/.skillix/cache/repos/
 */
export function getReposCacheDir(): string {
  return path.join(getGlobalCacheDir(), 'repos');
}

/**
 * 获取特定仓库的缓存目录
 * ~/.skillix/cache/repos/{dirName}/
 */
export function getRepoCacheDir(dirName: string): string {
  return path.join(getReposCacheDir(), dirName);
}

/**
 * 获取仓库中的技能目录
 * ~/.skillix/cache/repos/{dirName}/skills/
 */
export function getRepoSkillsDir(dirName: string): string {
  return path.join(getRepoCacheDir(dirName), 'skills');
}

/**
 * 获取特定技能在缓存中的路径
 * ~/.skillix/cache/repos/{dirName}/skills/{skillName}/
 */
export function getCachedSkillDir(dirName: string, skillName: string): string {
  return path.join(getRepoSkillsDir(dirName), skillName);
}

/**
 * 获取索引缓存目录
 * ~/.skillix/cache/indexes/
 */
export function getIndexesCacheDir(): string {
  return path.join(getGlobalCacheDir(), 'indexes');
}

/**
 * 获取源索引目录
 * ~/.skillix/cache/indexes/sources/
 */
export function getSourcesIndexDir(): string {
  return path.join(getIndexesCacheDir(), 'sources');
}

/**
 * 获取特定源的索引文件路径
 * ~/.skillix/cache/indexes/sources/{dirName}.json
 */
export function getSourceIndexPath(dirName: string): string {
  return path.join(getSourcesIndexDir(), `${dirName}.json`);
}

/**
 * 获取聚合清单文件路径
 * ~/.skillix/cache/indexes/manifest.json
 */
export function getManifestPath(): string {
  return path.join(getIndexesCacheDir(), 'manifest.json');
}

/**
 * 获取下载临时目录
 * ~/.skillix/cache/downloads/
 */
export function getDownloadsCacheDir(): string {
  return path.join(getGlobalCacheDir(), 'downloads');
}

/**
 * 获取全局安装记录文件路径
 * ~/.skillix/installed.json
 */
export function getGlobalInstalledPath(): string {
  return path.join(path.dirname(getGlobalCacheDir()), 'installed.json');
}

/**
 * 获取项目安装记录文件路径
 * {projectRoot}/.skillix/installed.json
 */
export function getProjectInstalledPath(projectRoot: string): string {
  return path.join(projectRoot, '.skillix', 'installed.json');
}
