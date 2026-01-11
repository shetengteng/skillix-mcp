/**
 * 技能源管理服务
 */

import type { SourceConfig } from '../types.js';
import { getGlobalConfig, saveGlobalConfig } from './global.js';
import { getProjectConfig, saveProjectConfig, initProjectConfig } from './project.js';
import { getEffectiveConfig } from './effective.js';

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
