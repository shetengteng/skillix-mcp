/**
 * sx-config 工具
 * 配置管理：get, set, init, sources
 */

import type { ToolResponse, SxConfigParams } from '../types.js';
import { handleGet } from './get.js';
import { handleSet } from './set.js';
import { handleInit } from './init.js';
import { handleSources } from './sources.js';

// 导出子命令处理函数
export { handleGet, handleSet, handleInit, handleSources };

// 导出类型
export type { SxConfigParams };

/**
 * sx-config 工具主入口
 */
export function sxConfig(params: SxConfigParams): ToolResponse {
  const { action } = params;
  
  switch (action) {
    case 'get':
      return handleGet(params);
    case 'set':
      return handleSet(params);
    case 'init':
      return handleInit(params);
    case 'sources':
      return handleSources(params);
    default:
      return {
        success: false,
        message: `未知操作: ${action}`,
        errors: ['支持的操作: get, set, init, sources'],
      };
  }
}

/**
 * 工具定义（用于 MCP 注册）
 */
export const sxConfigDefinition = {
  name: 'sx-config',
  description: '配置管理工具，支持获取、设置配置和管理技能源',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['get', 'set', 'init', 'sources'],
        description: '操作类型',
      },
      scope: {
        type: 'string',
        enum: ['global', 'project'],
        description: '配置范围（默认 global）',
      },
      projectRoot: {
        type: 'string',
        description: '项目根目录路径（项目级操作时需要）',
      },
      key: {
        type: 'string',
        description: '配置键（get/set 时使用）',
      },
      value: {
        description: '配置值（set 时使用）',
      },
      sourceAction: {
        type: 'string',
        enum: ['list', 'add', 'remove'],
        description: '源操作类型（sources 时使用）',
      },
      source: {
        type: 'object',
        description: '技能源配置（sources add 时使用）',
        properties: {
          name: { type: 'string' },
          url: { type: 'string' },
          branch: { type: 'string' },
          default: { type: 'boolean' },
        },
      },
      sourceName: {
        type: 'string',
        description: '技能源名称（sources remove 时使用）',
      },
    },
    required: ['action'],
  },
  handler: (args: any): ToolResponse => sxConfig(args as SxConfigParams),
};
