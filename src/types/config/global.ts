/**
 * 全局配置类型定义
 */

import type { SkillSource } from './source.js';
import type { SuggestThreshold } from './suggest-threshold.js';
import type { LoggingConfig } from './logging.js';
import type { CacheConfig } from './cache.js';

/**
 * 全局配置 (~/.skillix/config.json)
 */
export interface GlobalConfig {
  version: string;
  sources: SkillSource[];
  defaultScope: 'global' | 'project';
  format: 'xml' | 'json';
  autoSuggest: boolean;
  suggestThreshold: SuggestThreshold;
  logging: LoggingConfig;
  cache: CacheConfig;
}

/**
 * 默认全局配置
 */
export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  version: '1.0.0',
  sources: [
    {
      name: 'official',
      url: 'https://github.com/shetengteng/skillix-hub',
      branch: 'main',
      default: true,
    },
  ],
  defaultScope: 'global',
  format: 'xml',
  autoSuggest: true,
  suggestThreshold: {
    repeatCount: 3,
    stepCount: 5,
  },
  logging: {
    level: 'info',
    maxFiles: 5,
    maxSize: '10MB',
  },
  cache: {
    enabled: true,
    ttl: 3600,
  },
};
