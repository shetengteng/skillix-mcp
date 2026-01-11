/**
 * 配置服务统一导出
 */

export { getGlobalConfig, saveGlobalConfig } from './global.js';
export { getProjectConfig, saveProjectConfig, initProjectConfig } from './project.js';
export { addSource, removeSource, getAllSources } from './source.js';
export { getEffectiveConfig } from './effective.js';

// 导出类型
export type { GlobalConfig, ProjectConfig, CacheConfig, LoggingConfig, SuggestThreshold, FeedbackConfig } from '../types.js';
export { DEFAULT_GLOBAL_CONFIG, DEFAULT_PROJECT_CONFIG } from '../types.js';
