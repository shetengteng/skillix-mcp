/**
 * sx-feedback 工具
 * 技能反馈管理工具入口
 */

import type { ToolResponse, SxFeedbackParams } from '../types.js';
import { handleRecord } from './record.js';
import { handleList } from './list.js';
import { handleAnalyze } from './analyze.js';
import { handleClear } from './clear.js';
import { error } from '../../utils/response.js';

// 导出类型
export type { SxFeedbackParams };

/**
 * sx-feedback 工具主入口
 */
export function sxFeedback(params: SxFeedbackParams): ToolResponse {
  const { action } = params;
  
  switch (action) {
    case 'record':
      return handleRecord(params);
    case 'list':
      return handleList(params);
    case 'analyze':
      return handleAnalyze(params);
    case 'clear':
      return handleClear(params);
    default:
      return error({
        message: `未知操作: ${action}`,
        errors: ['支持的操作: record, list, analyze, clear'],
      });
  }
}

/**
 * 工具定义（用于 MCP 注册）
 */
export const sxFeedbackDefinition = {
  name: 'sx-feedback',
  description: '技能反馈管理工具，记录和分析技能使用反馈',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['record', 'list', 'analyze', 'clear'],
        description: '操作类型',
      },
      skillName: {
        type: 'string',
        description: '技能名称（record/list/analyze 时需要）',
      },
      result: {
        type: 'string',
        enum: ['success', 'failure', 'partial'],
        description: '执行结果（record 时需要）',
      },
      task: {
        type: 'string',
        description: '任务描述（record 时可选）',
      },
      notes: {
        type: 'string',
        description: '备注信息（record 时可选）',
      },
      scope: {
        type: 'string',
        enum: ['global', 'project'],
        description: '技能范围（默认 global）',
      },
      projectRoot: {
        type: 'string',
        description: '项目根目录（scope=project 时使用）',
      },
      days: {
        type: 'number',
        description: '时间范围（list/analyze 时可选，单位：天）',
      },
    },
    required: ['action'],
  },
  handler: (args: any): ToolResponse => sxFeedback(args as SxFeedbackParams),
};
