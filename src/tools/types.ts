/**
 * MCP 工具类型定义
 */

import type { SkillMetadata, SkillScope, SourceConfig } from '../services/types.js';

// 导出验证相关类型
export { ErrorCode, type ValidationResult } from '../utils/validation.js';

// ============================================
// 工具响应类型
// ============================================

/**
 * 工具响应
 */
export interface ToolResponse {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: string[];
  warnings?: string[];
}

// ============================================
// 工具参数类型
// ============================================

/**
 * sx-skill 工具参数
 */
export interface SxSkillParams {
  action: 'list' | 'read' | 'create' | 'update' | 'delete';
  name?: string;
  scope?: SkillScope;
  projectRoot?: string;
  metadata?: SkillMetadata;
  body?: string;
  query?: string;
}

/**
 * sx-config 工具参数
 */
export interface SxConfigParams {
  action: 'get' | 'set' | 'init' | 'sources' | 'refresh';
  scope?: 'global' | 'project';
  projectRoot?: string;
  key?: string;
  value?: any;
  sourceAction?: 'list' | 'add' | 'remove';
  source?: SourceConfig;
  sourceName?: string;
}

/**
 * sx-help 工具参数
 */
export interface SxHelpParams {
  topic?: 'overview' | 'skill' | 'config' | 'market' | 'dispatch' | 'feedback' | 'all';
}

/**
 * sx-market 工具参数
 */
export interface SxMarketParams {
  /** 操作类型 */
  action: 'search' | 'install' | 'uninstall' | 'sync' | 'status';
  /** 搜索关键词（search 时需要） */
  query?: string;
  /** 技能名称（install/uninstall 时需要） */
  name?: string;
  /** 技能源名称 */
  source?: string;
  /** 安装/卸载范围 */
  scope?: 'global' | 'project';
  /** 按标签筛选（search 时可选） */
  tags?: string[];
  /** 强制覆盖（install/sync 时可选） */
  force?: boolean;
  /** 结果数量限制（search 时可选） */
  limit?: number;
  /** 项目根目录 */
  projectRoot?: string;
}

/**
 * sx-dispatch 工具参数
 */
export interface SxDispatchParams {
  /** 任务描述 */
  task: string;
  /** 上下文信息 */
  context?: string;
  /** 提示词列表 */
  hints?: string[];
  /** 项目根目录 */
  projectRoot?: string;
}

/**
 * sx-feedback 工具参数
 */
export interface SxFeedbackParams {
  /** 操作类型 */
  action: 'record' | 'list' | 'analyze' | 'clear';
  /** 技能名称（record/list/analyze 时需要） */
  skillName?: string;
  /** 执行结果（record 时需要） */
  result?: 'success' | 'failure' | 'partial';
  /** 任务描述（record 时可选） */
  task?: string;
  /** 备注信息（record 时可选） */
  notes?: string;
  /** 技能范围 */
  scope?: 'global' | 'project';
  /** 项目根目录 */
  projectRoot?: string;
  /** 时间范围（list/analyze 时可选，单位：天） */
  days?: number;
}
