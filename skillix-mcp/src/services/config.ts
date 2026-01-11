/**
 * 配置服务
 * 处理全局和项目级配置的读写
 */

import type { GlobalConfig, ProjectConfig, SourceConfig, SkillSource } from '../types/config.js';
import { DEFAULT_GLOBAL_CONFIG, DEFAULT_PROJECT_CONFIG } from '../types/config.js';
import * as paths from '../utils/paths.js';
import * as fs from '../utils/fs.js';

/**
 * 获取全局配置
 */
export function getGlobalConfig(): GlobalConfig {
  const configPath = paths.getGlobalConfigPath();
  const config = fs.readJson<GlobalConfig>(configPath);
  
  if (!config) {
    return DEFAULT_GLOBAL_CONFIG;
  }
  
  // 合并默认值
  return {
    ...DEFAULT_GLOBAL_CONFIG,
    ...config,
    suggestThreshold: {
      ...DEFAULT_GLOBAL_CONFIG.suggestThreshold,
      ...config.suggestThreshold,
    },
    logging: {
      ...DEFAULT_GLOBAL_CONFIG.logging,
      ...config.logging,
    },
    cache: {
      ...DEFAULT_GLOBAL_CONFIG.cache,
      ...config.cache,
    },
  };
}

/**
 * 保存全局配置
 */
export function saveGlobalConfig(config: GlobalConfig): void {
  const configPath = paths.getGlobalConfigPath();
  fs.ensureDir(paths.getGlobalDir());
  fs.writeJson(configPath, config);
}

/**
 * 获取项目配置
 */
export function getProjectConfig(projectRoot: string): ProjectConfig | null {
  const configPath = paths.getProjectConfigPath(projectRoot);
  
  if (!fs.exists(configPath)) {
    return null;
  }
  
  const config = fs.readJson<ProjectConfig>(configPath);
  
  if (!config) {
    return null;
  }
  
  // 合并默认值
  return {
    ...DEFAULT_PROJECT_CONFIG,
    ...config,
    feedback: config.feedback ? {
      enabled: config.feedback.enabled ?? DEFAULT_PROJECT_CONFIG.feedback!.enabled,
      autoRecord: config.feedback.autoRecord ?? DEFAULT_PROJECT_CONFIG.feedback!.autoRecord,
    } : DEFAULT_PROJECT_CONFIG.feedback,
  };
}

/**
 * 保存项目配置
 */
export function saveProjectConfig(projectRoot: string, config: ProjectConfig): void {
  const configPath = paths.getProjectConfigPath(projectRoot);
  fs.ensureDir(paths.getProjectDir(projectRoot));
  fs.writeJson(configPath, config);
}

/**
 * 初始化项目配置
 */
export function initProjectConfig(projectRoot: string, options?: Partial<ProjectConfig>): ProjectConfig {
  const config: ProjectConfig = {
    ...DEFAULT_PROJECT_CONFIG,
    ...options,
  };
  
  saveProjectConfig(projectRoot, config);
  
  // 确保技能目录存在
  fs.ensureDir(paths.getProjectSkillsDir(projectRoot));
  
  return config;
}

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

/**
 * 添加技能源
 */
export function addSource(
  source: SourceConfig,
  scope: 'global' | 'project',
  projectRoot?: string
): void {
  if (scope === 'global') {
    const config = getGlobalConfig();
    const existingIndex = config.sources.findIndex(s => s.name === source.name);
    
    if (existingIndex >= 0) {
      config.sources[existingIndex] = source;
    } else {
      config.sources.push(source);
    }
    
    saveGlobalConfig(config);
  } else if (projectRoot) {
    let config = getProjectConfig(projectRoot);
    
    if (!config) {
      config = initProjectConfig(projectRoot);
    }
    
    if (!config.sources) {
      config.sources = [];
    }
    
    const existingIndex = config.sources.findIndex(s => s.name === source.name);
    
    if (existingIndex >= 0) {
      config.sources[existingIndex] = source;
    } else {
      config.sources.push(source);
    }
    
    saveProjectConfig(projectRoot, config);
  }
}

/**
 * 移除技能源
 */
export function removeSource(
  sourceName: string,
  scope: 'global' | 'project',
  projectRoot?: string
): boolean {
  if (scope === 'global') {
    const config = getGlobalConfig();
    const index = config.sources.findIndex(s => s.name === sourceName);
    
    if (index >= 0) {
      config.sources.splice(index, 1);
      saveGlobalConfig(config);
      return true;
    }
  } else if (projectRoot) {
    const config = getProjectConfig(projectRoot);
    
    if (config?.sources) {
      const index = config.sources.findIndex(s => s.name === sourceName);
      
      if (index >= 0) {
        config.sources.splice(index, 1);
        saveProjectConfig(projectRoot, config);
        return true;
      }
    }
  }
  
  return false;
}

/**
 * 获取所有技能源
 */
export function getAllSources(projectRoot?: string): SourceConfig[] {
  const { effective } = getEffectiveConfig(projectRoot);
  return effective.sources;
}
