/**
 * sx-config 工具参数类型定义
 */

import type { SourceConfig } from '../config/source.js';

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
