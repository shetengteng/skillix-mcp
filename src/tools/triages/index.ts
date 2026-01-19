/**
 * sx-triage 工具
 * 智能分流工具入口
 */

import type { ToolResponse, SxTriageParams } from '../types.js';
import { handleAnalyze } from './analyze.js';

// 导出类型
export type { SxTriageParams };

/**
 * sx-triage 工具主入口
 */
export function sxTriage(params: SxTriageParams): ToolResponse {
  return handleAnalyze(params);
}

/**
 * 工具定义（用于 MCP 注册）
 */
export const sxTriageDefinition = {
  name: 'sx-triage',
  description: '智能分流工具，分析任务并推荐最佳操作',
  inputSchema: {
    type: 'object',
    properties: {
      task: {
        type: 'string',
        description: '任务描述（必需）',
      },
      context: {
        type: 'string',
        description: '上下文信息（可选）',
      },
      hints: {
        type: 'array',
        items: { type: 'string' },
        description: '提示词列表（可选）',
      },
      projectRoot: {
        type: 'string',
        description: '项目根目录（可选）',
      },
    },
    required: ['task'],
  },
  handler: (args: any): ToolResponse => sxTriage(args as SxTriageParams),
};
