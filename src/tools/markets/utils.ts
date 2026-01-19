/**
 * sx-market 工具层工具函数
 */

import type { 
  SyncResultData, 
  SyncedSourceInfo, 
  FailedSourceInfo,
  StatusResultData,
  SourceStatusInfo,
  StatusSummary,
} from '../../services/types.js';

/**
 * 构建同步结果数据
 */
export function buildSyncResultData(
  synced: Array<{ name: string; skillCount?: number; newSkills?: number }>,
  failed: Array<{ name: string; error?: string }>
): SyncResultData {
  return {
    synced: synced.map(s => ({
      name: s.name,
      skillCount: s.skillCount,
      newSkills: s.newSkills,
    })),
    failed: failed.map(f => ({
      name: f.name,
      error: f.error,
    })),
  };
}

/**
 * 构建状态结果数据
 */
export function buildStatusResultData(
  sources: SourceStatusInfo[],
  totalCacheSize: string,
  summary: StatusSummary
): StatusResultData {
  return {
    sources,
    totalCacheSize,
    summary,
  };
}
