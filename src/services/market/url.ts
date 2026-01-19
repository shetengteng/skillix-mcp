/**
 * Git URL 解析工具
 * 处理 Git URL 到本地缓存目录的映射
 */

import type { ParsedGitUrl } from '../types.js';

/**
 * 解析 Git URL
 * 支持 HTTPS 和 SSH 格式
 * 
 * @example
 * parseGitUrl('https://github.com/owner/repo')
 * parseGitUrl('https://github.com/owner/repo.git')
 * parseGitUrl('git@github.com:owner/repo.git')
 */
export function parseGitUrl(url: string): ParsedGitUrl | null {
  // HTTPS 格式: https://github.com/owner/repo(.git)?
  const httpsMatch = url.match(/^https?:\/\/([^/]+)\/([^/]+)\/([^/]+?)(\.git)?$/);
  if (httpsMatch) {
    const [, host, owner, repo] = httpsMatch;
    return buildParsedUrl(host, owner, repo);
  }

  // SSH 格式: git@github.com:owner/repo.git
  const sshMatch = url.match(/^git@([^:]+):([^/]+)\/([^/]+?)(\.git)?$/);
  if (sshMatch) {
    const [, host, owner, repo] = sshMatch;
    return buildParsedUrl(host, owner, repo);
  }

  return null;
}

/**
 * 构建解析结果
 */
function buildParsedUrl(host: string, owner: string, repo: string): ParsedGitUrl {
  // 移除可能的 .git 后缀
  const cleanRepo = repo.replace(/\.git$/, '');
  
  return {
    host,
    owner,
    repo: cleanRepo,
    // 扁平化目录名: github.com_owner_repo
    dirName: `${host}_${owner}_${cleanRepo}`,
    // 源 ID: github.com/owner/repo
    sourceId: `${host}/${owner}/${cleanRepo}`,
  };
}

/**
 * 从源 ID 生成目录名
 */
export function sourceIdToDirName(sourceId: string): string {
  return sourceId.replace(/\//g, '_');
}

/**
 * 从目录名还原源 ID
 */
export function dirNameToSourceId(dirName: string): string {
  // 第一个下划线后是 owner，第二个下划线后是 repo
  const parts = dirName.split('_');
  if (parts.length >= 3) {
    return `${parts[0]}/${parts[1]}/${parts.slice(2).join('_')}`;
  }
  return dirName;
}
