/**
 * 全局配置服务
 */

import type { GlobalConfig } from '../types.js';
import { DEFAULT_GLOBAL_CONFIG } from '../types.js';
import * as paths from '../../utils/paths.js';
import * as fs from '../../utils/fs.js';

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
