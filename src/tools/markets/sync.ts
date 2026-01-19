/**
 * sx-market sync 操作
 * 同步技能源缓存
 */

import type { ToolResponse, SxMarketParams } from '../types.js';
import type { SyncResultData } from '../../services/types.js';
import { syncAllSources, syncSourceByName } from '../../services/market/index.js';
import { buildSyncResultData } from './utils.js';
import { success, error } from '../../utils/response.js';

/**
 * 处理同步操作
 */
export function handleSync(params: SxMarketParams): ToolResponse {
  const { source, force = false } = params;

  if (source) {
    // 同步指定源
    const result = syncSourceByName(source, force);
    
    if (!result) {
      return error({
        message: `未找到技能源 "${source}"`,
        errors: [`请检查源名称是否正确，可通过 sx-config sources list 查看已配置的源`],
      });
    }

    if (result.status !== 'synced') {
      return error({
        message: `同步技能源 "${source}" 失败`,
        errors: [result.error || '未知错误'],
      });
    }

    const data: SyncResultData = buildSyncResultData(
      [{ name: result.name, skillCount: result.skillCount, newSkills: result.newSkills }],
      []
    );

    return success({
      message: `成功同步技能源 "${source}"`,
      data,
    });
  }

  // 同步所有源
  const { synced, failed } = syncAllSources(force);

  if (synced.length === 0 && failed.length > 0) {
    return error({
      message: '所有技能源同步失败',
      errors: failed.map(f => `${f.name}: ${f.error}`),
    });
  }

  const warnings = failed.length > 0 
    ? failed.map(f => `${f.name}: ${f.error}`)
    : undefined;

  const data: SyncResultData = buildSyncResultData(synced, failed);

  return success({
    message: `同步完成，${synced.length} 个成功${failed.length > 0 ? `，${failed.length} 个失败` : ''}`,
    data,
    warnings,
  });
}
