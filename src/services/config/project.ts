/**
 * 项目配置服务
 */

import type { ProjectConfig } from '../types.js';
import { DEFAULT_PROJECT_CONFIG } from '../types.js';
import * as paths from '../../utils/paths.js';
import * as fs from '../../utils/fs.js';

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
