/**
 * sx-market 工具
 * 技能市场：搜索、安装、卸载、同步、状态
 */

import type { ToolResponse, SxMarketParams } from '../types.js';
import { handleSearch } from './search.js';
import { handleInstall } from './install.js';
import { handleUninstall } from './uninstall.js';
import { handleSync } from './sync.js';
import { handleStatus } from './status.js';

// 导出子命令处理函数
export { handleSearch, handleInstall, handleUninstall, handleSync, handleStatus };

// 导出类型
export type { SxMarketParams };

/**
 * sx-market 工具主入口
 */
export function sxMarket(params: SxMarketParams): ToolResponse {
  const { action } = params;

  switch (action) {
    case 'search':
      return handleSearch(params);
    case 'install':
      return handleInstall(params);
    case 'uninstall':
      return handleUninstall(params);
    case 'sync':
      return handleSync(params);
    case 'status':
      return handleStatus(params);
    default:
      return {
        success: false,
        message: `未知操作: ${action}`,
        errors: ['支持的操作: search, install, uninstall, sync, status'],
      };
  }
}

/**
 * 工具定义（用于 MCP 注册）
 */
export const sxMarketDefinition = {
  name: 'sx-market',
  description: `技能市场：搜索、安装、卸载、同步、状态

【操作说明】
- search: 搜索远程技能源中的技能
- install: 从技能源安装技能到本地（支持 --force 覆盖）
- uninstall: 卸载已安装的技能
- sync: 同步技能源缓存（从 GitHub 拉取最新）
- status: 查看技能源状态

【更新已安装技能】
先执行 sync 更新缓存，再使用 install --force 重新安装`,
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['search', 'install', 'uninstall', 'sync', 'status'],
        description: '操作类型',
      },
      query: {
        type: 'string',
        description: '搜索关键词（search 时需要）',
      },
      name: {
        type: 'string',
        description: '技能名称（install/uninstall 时需要）',
      },
      source: {
        type: 'string',
        description: '技能源名称（search/install/sync/status 时可选）',
      },
      scope: {
        type: 'string',
        enum: ['global', 'project'],
        description: '操作范围（默认 global）',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: '按标签筛选（search 时可选）',
      },
      force: {
        type: 'boolean',
        description: '强制操作（install 覆盖已存在/sync 忽略缓存有效期）',
      },
      limit: {
        type: 'number',
        description: '结果数量限制（search 时可选，默认 20）',
      },
      projectRoot: {
        type: 'string',
        description: '项目根目录（scope=project 时使用）',
      },
    },
    required: ['action'],
  },
  handler: (args: any): ToolResponse => sxMarket(args as SxMarketParams),
};
