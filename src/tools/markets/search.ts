/**
 * sx-market search 操作
 * 搜索技能市场
 */

import type { ToolResponse, SxMarketParams } from '../types.js';
import { searchSkills, syncAllSources, loadManifest } from '../../services/market/index.js';
import { success, error } from '../../utils/response.js';

/**
 * 处理搜索操作
 */
export function handleSearch(params: SxMarketParams): ToolResponse {
  const { query, source, tags, limit = 20 } = params;

  if (!query) {
    return error({
      message: '搜索需要提供关键词',
      errors: ['缺少 query 参数'],
    });
  }

  // 检查是否有缓存，如果没有则先同步
  const manifest = loadManifest();
  if (!manifest || manifest.sources.length === 0) {
    // 尝试同步
    const syncResult = syncAllSources();
    if (syncResult.synced.length === 0 && syncResult.failed.length > 0) {
      return error({
        message: '无法搜索：所有技能源同步失败',
        errors: syncResult.failed.map(f => `${f.name}: ${f.error}`),
      });
    }
  }

  // 执行搜索
  const result = searchSkills({
    query,
    source,
    tags,
    limit,
  });

  // 收集警告
  const warnings: string[] = [];
  for (const src of result.sourceStatus) {
    if (src.status === 'error') {
      warnings.push(`技能源 "${src.name}" (${src.id}) 同步失败: ${src.error}`);
    }
  }

  if (result.total === 0) {
    return success({
      message: source 
        ? `在源 "${source}" 中未找到匹配 "${query}" 的技能`
        : `未找到匹配 "${query}" 的技能`,
      data: {
        total: 0,
        results: [],
        sourceStatus: result.sourceStatus,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  }

  const sourceCount = new Set(result.results.map(r => r.sourceId)).size;

  return success({
    message: `找到 ${result.total} 个技能（来自 ${sourceCount} 个源）`,
    data: {
      total: result.total,
      results: result.results.map(r => ({
        name: r.name,
        description: r.description,
        version: r.version,
        tags: r.tags,
        sourceId: r.sourceId,
        sourceName: r.sourceName,
        author: r.author,
      })),
      sourceStatus: result.sourceStatus,
    },
    warnings: warnings.length > 0 ? warnings : undefined,
  });
}
