/**
 * 有效配置计算服务
 */

import type { GlobalConfig, ProjectConfig, SourceConfig } from '../types.js';
import { getGlobalConfig } from './global.js';
import { getProjectConfig } from './project.js';

/**
 * 获取有效配置（本地优先策略）
 * 项目配置优先，不存在则使用全局配置
 */
export function getEffectiveConfig(projectRoot?: string): {
  global: GlobalConfig;
  project: ProjectConfig | null;
  effective: {
    sources: SourceConfig[];
    format: 'xml' | 'json';
    autoSuggest: boolean;
  };
} {
  const globalConfig = getGlobalConfig();
  const projectConfig = projectRoot ? getProjectConfig(projectRoot) : null;
  
  // 本地优先策略
  const effectiveSources = projectConfig?.sources && projectConfig.sources.length > 0
    ? projectConfig.sources
    : globalConfig.sources;
  
  const effectiveFormat = projectConfig?.format ?? globalConfig.format ?? 'xml';
  const effectiveAutoSuggest = projectConfig?.autoSuggest ?? globalConfig.autoSuggest ?? true;
  
  return {
    global: globalConfig,
    project: projectConfig,
    effective: {
      sources: effectiveSources,
      format: effectiveFormat,
      autoSuggest: effectiveAutoSuggest,
    },
  };
}
