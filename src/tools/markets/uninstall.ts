/**
 * sx-market uninstall 操作
 * 卸载已安装的技能
 */

import type { ToolResponse, SxMarketParams } from '../types.js';
import { uninstallSkill } from '../../services/market/index.js';
import { success, error } from '../../utils/response.js';

/**
 * 处理卸载操作
 */
export function handleUninstall(params: SxMarketParams): ToolResponse {
  const { name, scope = 'global', projectRoot } = params;

  if (!name) {
    return error({
      message: '卸载需要提供技能名称',
      errors: ['缺少 name 参数'],
    });
  }

  // 执行卸载
  // 注意：scope 可以是 'auto'，会自动查找
  const result = uninstallSkill({
    name,
    scope: scope as 'global' | 'project' | 'auto',
    projectRoot,
  });

  if (!result.success) {
    return error({
      message: `卸载技能 "${name}" 失败`,
      errors: [result.error || '未知错误'],
    });
  }

  return success({
    message: `成功卸载技能 "${name}"`,
    data: {
      name: result.name,
      scope: result.scope,
      path: result.path,
      uninstalledAt: result.uninstalledAt,
    },
  });
}
