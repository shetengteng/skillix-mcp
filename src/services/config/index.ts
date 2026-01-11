/**
 * 配置服务统一导出
 */

export { getGlobalConfig, saveGlobalConfig } from './global.js';
export { getProjectConfig, saveProjectConfig, initProjectConfig } from './project.js';
export { addSource, removeSource, getAllSources } from './source.js';
export { getEffectiveConfig } from './effective.js';
