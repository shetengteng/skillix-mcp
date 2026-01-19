/**
 * sx-market status 操作
 * 查看技能源状态
 */

import type { ToolResponse, SxMarketParams } from '../types.js';
import type { StatusResultData } from '../../services/types.js';
import { getStatus } from '../../services/market/index.js';
import { buildStatusResultData } from './utils.js';
import { success, error } from '../../utils/response.js';

/**
 * 处理状态查询操作
 */
export function handleStatus(params: SxMarketParams): ToolResponse {
  const { source } = params;

  const result = getStatus(source);

  if (result.sources.length === 0) {
    if (source) {
      return error({
        message: `未找到技能源 "${source}"`,
        errors: ['请检查源名称是否正确，可通过 sx-config sources list 查看已配置的源'],
      });
    }
    
    const data: StatusResultData = buildStatusResultData(
      [],
      '0 B',
      result.summary
    );
    
    return success({
      message: '暂无技能源，请先添加并同步',
      data,
    });
  }

  const { synced, error: errorCount, notSynced, total } = result.summary;
  let statusSummary = `${total} 个源`;
  
  const parts: string[] = [];
  if (synced > 0) parts.push(`${synced} 个已同步`);
  if (errorCount > 0) parts.push(`${errorCount} 个错误`);
  if (notSynced > 0) parts.push(`${notSynced} 个未同步`);
  
  if (parts.length > 0) {
    statusSummary += `，${parts.join('，')}`;
  }

  const data: StatusResultData = buildStatusResultData(
    result.sources,
    result.totalCacheSize,
    result.summary
  );

  return success({
    message: statusSummary,
    data,
  });
}
