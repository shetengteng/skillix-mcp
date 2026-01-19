/**
 * 同步服务
 * 处理技能源的同步操作
 */

import { parseGitUrl } from './url.js';
import { cloneRepo, pullRepo, repoExists, getCommitHash } from './git.js';
import { buildSourceIndex, saveSourceIndex, updateManifest, loadManifest } from './index-builder.js';
import { getRepoCacheDir } from './paths.js';
import { getAllSources } from '../config/index.js';
import type { SkillSource, SourceSyncResult, ManifestSource, SourceStatus } from '../types.js';

/**
 * 同步单个源
 */
export function syncSource(source: SkillSource, force: boolean = false): SourceSyncResult {
  const parsed = parseGitUrl(source.url);
  
  if (!parsed) {
    return {
      id: source.url,
      name: source.name,
      url: source.url,
      status: 'error',
      error: `无效的 Git URL: ${source.url}`,
    };
  }

  const { dirName, sourceId } = parsed;
  let commit: string | undefined;
  let hasUpdates = false;

  try {
    if (repoExists(dirName)) {
      // 仓库已存在，执行拉取
      const pullResult = pullRepo(dirName);
      if (!pullResult.success) {
        return {
          id: sourceId,
          name: source.name,
          url: source.url,
          status: 'error',
          error: pullResult.error,
        };
      }
      commit = pullResult.commit;
      hasUpdates = pullResult.hasUpdates || false;
    } else {
      // 仓库不存在，执行克隆
      const cloneResult = cloneRepo(source);
      if (!cloneResult.success) {
        return {
          id: sourceId,
          name: source.name,
          url: source.url,
          status: 'error',
          error: cloneResult.error,
        };
      }
      commit = cloneResult.commit;
      hasUpdates = true; // 首次克隆视为有更新
    }

    // 构建索引
    const indexResult = buildSourceIndex(source, commit || '');
    if (!indexResult.success || !indexResult.index) {
      return {
        id: sourceId,
        name: source.name,
        url: source.url,
        status: 'error',
        error: indexResult.error || '构建索引失败',
      };
    }

    // 保存索引
    saveSourceIndex(dirName, indexResult.index);

    // 更新清单
    const manifestSource: ManifestSource = {
      id: sourceId,
      name: source.name,
      url: source.url,
      branch: source.branch || 'main',
      commit,
      syncedAt: new Date().toISOString(),
      skillCount: indexResult.index.skills.length,
      status: 'synced',
      indexFile: `sources/${dirName}.json`,
    };
    updateManifest(manifestSource);

    return {
      id: sourceId,
      name: source.name,
      url: source.url,
      status: 'synced',
      skillCount: indexResult.index.skills.length,
      lastSync: manifestSource.syncedAt,
      commit,
      newSkills: hasUpdates ? indexResult.index.skills.length : 0,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 更新清单中的错误状态
    const manifestSource: ManifestSource = {
      id: sourceId,
      name: source.name,
      url: source.url,
      branch: source.branch || 'main',
      status: 'error',
      error: errorMessage,
    };
    updateManifest(manifestSource);

    return {
      id: sourceId,
      name: source.name,
      url: source.url,
      status: 'error',
      error: errorMessage,
    };
  }
}

/**
 * 同步所有源
 */
export function syncAllSources(force: boolean = false): {
  synced: SourceSyncResult[];
  failed: SourceSyncResult[];
} {
  const sources = getAllSources();
  const synced: SourceSyncResult[] = [];
  const failed: SourceSyncResult[] = [];

  for (const source of sources) {
    const result = syncSource(source, force);
    if (result.status === 'synced') {
      synced.push(result);
    } else {
      failed.push(result);
    }
  }

  return { synced, failed };
}

/**
 * 同步指定源
 */
export function syncSourceByName(sourceName: string, force: boolean = false): SourceSyncResult | null {
  const sources = getAllSources();
  const source = sources.find(s => s.name === sourceName);
  
  if (!source) {
    return null;
  }

  return syncSource(source, force);
}

/**
 * 检查源是否需要同步
 */
export function needsSync(sourceId: string, ttl: number = 3600): boolean {
  const manifest = loadManifest();
  if (!manifest) {
    return true;
  }

  const source = manifest.sources.find(s => s.id === sourceId);
  if (!source || source.status !== 'synced' || !source.syncedAt) {
    return true;
  }

  const lastSync = new Date(source.syncedAt).getTime();
  const now = Date.now();
  return (now - lastSync) > ttl * 1000;
}
