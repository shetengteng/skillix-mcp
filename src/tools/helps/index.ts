/**
 * sx-help 工具
 * 帮助信息和使用指南
 */

import type { ToolResponse, SxHelpParams } from '../types.js';
import { OVERVIEW_HELP } from './overview.js';
import { SKILL_HELP } from './skill.js';
import { CONFIG_HELP } from './config.js';
import { MARKET_HELP } from './market.js';
import { DISPATCH_HELP } from './dispatch.js';
import { success, error } from '../../utils/response.js';

// 导出帮助内容
export { OVERVIEW_HELP, SKILL_HELP, CONFIG_HELP, MARKET_HELP, DISPATCH_HELP };

// 导出类型
export type { SxHelpParams };

/**
 * sx-help 工具主入口
 */
export function sxHelp(params: SxHelpParams): ToolResponse {
  const { topic = 'overview' } = params;
  
  let helpContent: string;
  
  switch (topic) {
    case 'overview':
      helpContent = OVERVIEW_HELP;
      break;
    case 'skill':
      helpContent = SKILL_HELP;
      break;
    case 'config':
      helpContent = CONFIG_HELP;
      break;
    case 'market':
      helpContent = MARKET_HELP;
      break;
    case 'dispatch':
      helpContent = DISPATCH_HELP;
      break;
    case 'all':
      helpContent = [OVERVIEW_HELP, SKILL_HELP, CONFIG_HELP, MARKET_HELP, DISPATCH_HELP].join('\n\n---\n\n');
      break;
    default:
      return error({
        message: `未知主题: ${topic}`,
        errors: ['支持的主题: overview, skill, config, market, dispatch, all'],
      });
  }
  
  return success({
    message: `帮助信息: ${topic}`,
    data: {
      topic,
      content: helpContent.trim(),
    },
  });
}

/**
 * 工具定义（用于 MCP 注册）
 */
export const sxHelpDefinition = {
  name: 'sx-help',
  description: '帮助信息工具，提供 Skillix 使用指南',
  inputSchema: {
    type: 'object',
    properties: {
      topic: {
        type: 'string',
        enum: ['overview', 'skill', 'config', 'market', 'dispatch', 'all'],
        description: '帮助主题（默认 overview）',
      },
    },
  },
  handler: (args: any): ToolResponse => sxHelp(args as SxHelpParams),
};
