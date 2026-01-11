/**
 * MCP 工具参数类型定义
 */

import type { SkillMetadata } from '../types/skill/metadata.js';
import type { SkillScope } from '../types/skill/scope.js';
import type { SourceConfig } from '../types/config/source.js';

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
