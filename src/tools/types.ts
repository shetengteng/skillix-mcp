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
  action: 'get' | 'set' | 'init' | 'sources';
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
  topic?: 'overview' | 'skill' | 'config' | 'market' | 'triage' | 'all';
}
