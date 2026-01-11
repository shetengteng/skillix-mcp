"use strict";
/**
 * 配置相关类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROJECT_CONFIG = exports.DEFAULT_GLOBAL_CONFIG = void 0;
/**
 * 默认全局配置
 */
exports.DEFAULT_GLOBAL_CONFIG = {
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
/**
 * 默认项目配置
 */
exports.DEFAULT_PROJECT_CONFIG = {
    sources: [],
    format: 'xml',
    autoSuggest: true,
    feedback: {
        enabled: true,
        autoRecord: false,
    },
};
//# sourceMappingURL=config.js.map