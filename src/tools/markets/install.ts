/**
 * sx-market install 操作
 * 安装技能到本地
 */

import type { ToolResponse, SxMarketParams } from '../types.js';
import { installSkill, loadManifest, syncAllSources } from '../../services/market/index.js';
import { success, error } from '../../utils/response.js';

/**
 * 处理安装操作
 */
export function handleInstall(params: SxMarketParams): ToolResponse {
  const { name, source, scope = 'global', force = false, projectRoot } = params;

  if (!name) {
    return error({
      message: '安装需要提供技能名称',
      errors: ['缺少 name 参数'],
    });
  }

  // 检查 scope=project 时是否提供了 projectRoot
  if (scope === 'project' && !projectRoot) {
    return error({
      message: '项目级安装需要提供项目根目录',
      errors: ['scope=project 时需要提供 projectRoot 参数'],
    });
  }

  // 检查是否有缓存，如果没有则先同步
  const manifest = loadManifest();
  if (!manifest || manifest.sources.length === 0) {
    const syncResult = syncAllSources();
    if (syncResult.synced.length === 0 && syncResult.failed.length > 0) {
      return error({
        message: '无法安装：所有技能源同步失败',
        errors: syncResult.failed.map(f => `${f.name}: ${f.error}`),
      });
    }
  }

  // 执行安装
  const result = installSkill({
    name,
    source,
    scope,
    force,
    projectRoot,
  });

  if (!result.success) {
    return error({
      message: `安装技能 "${name}" 失败`,
      errors: [result.error || '未知错误'],
    });
  }

  return success({
    message: `成功安装技能 "${name}"`,
    data: {
      name: result.name,
      scope: result.scope,
      path: result.path,
      sourceId: result.sourceId,
      sourceName: result.sourceName,
      installedAt: result.installedAt,
    },
  });
}
