/**
 * 状态查询服务
 * 查询技能源的同步状态
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadManifest, getAllSourceStatus } from './index-builder.js';
import { getRepoCacheDir, getReposCacheDir } from './paths.js';
import { sourceIdToDirName } from './url.js';
import { exists } from '../../utils/fs.js';
import type { ManifestSource, SourceStatus, SourceStatusInfo, StatusSummary } from '../types.js';

/**
 * 源状态详情（兼容旧接口）
 */
export type SourceStatusDetail = SourceStatusInfo;

/**
 * 状态查询结果
 */
export interface StatusResult {
  sources: SourceStatusInfo[];
  totalCacheSize: string;
  summary: StatusSummary;
}

/**
 * 获取所有源状态
 */
export function getStatus(sourceName?: string): StatusResult {
  const allStatus = getAllSourceStatus();
  const sources: SourceStatusDetail[] = [];
  let totalSize = 0;

  // 统计
  const summary = {
    total: 0,
    synced: 0,
    error: 0,
    notSynced: 0,
  };

  for (const src of allStatus) {
    // 如果指定了源名称，只返回该源
    if (sourceName && src.name !== sourceName) {
      continue;
    }

    summary.total++;
    
    if (src.status === 'synced') {
      summary.synced++;
    } else if (src.status === 'error') {
      summary.error++;
    } else {
      summary.notSynced++;
    }

    // 计算缓存大小
    const dirName = sourceIdToDirName(src.id);
    const cacheDir = getRepoCacheDir(dirName);
    const cacheSize = exists(cacheDir) ? getDirSize(cacheDir) : 0;
    totalSize += cacheSize;

    sources.push({
      name: src.name,
      id: src.id,
      url: src.url,
      status: src.status,
      lastSync: src.syncedAt,
      commit: src.commit,
      skillCount: src.skillCount,
      cacheSize: formatSize(cacheSize),
      error: src.error,
    });
  }

  return {
    sources,
    totalCacheSize: formatSize(totalSize),
    summary,
  };
}

/**
 * 获取目录大小（递归）
 */
function getDirSize(dirPath: string): number {
  let size = 0;
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        size += getDirSize(fullPath);
      } else {
        try {
          const stat = fs.statSync(fullPath);
          size += stat.size;
        } catch {
          // 忽略无法访问的文件
        }
      }
    }
  } catch {
    // 忽略无法访问的目录
  }
  
  return size;
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

/**
 * 检查源是否过期
 */
export function isSourceOutdated(sourceId: string, ttl: number = 3600): boolean {
  const allStatus = getAllSourceStatus();
  const source = allStatus.find(s => s.id === sourceId);
  
  if (!source || source.status !== 'synced' || !source.syncedAt) {
    return true;
  }

  const lastSync = new Date(source.syncedAt).getTime();
  const now = Date.now();
  return (now - lastSync) > ttl * 1000;
}
