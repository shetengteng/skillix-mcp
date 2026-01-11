"use strict";
/**
 * 配置服务
 * 处理全局和项目级配置的读写
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalConfig = getGlobalConfig;
exports.saveGlobalConfig = saveGlobalConfig;
exports.getProjectConfig = getProjectConfig;
exports.saveProjectConfig = saveProjectConfig;
exports.initProjectConfig = initProjectConfig;
exports.getEffectiveConfig = getEffectiveConfig;
exports.addSource = addSource;
exports.removeSource = removeSource;
exports.getAllSources = getAllSources;
const config_js_1 = require("../types/config.js");
const paths = __importStar(require("../utils/paths.js"));
const fs = __importStar(require("../utils/fs.js"));
/**
 * 获取全局配置
 */
function getGlobalConfig() {
    const configPath = paths.getGlobalConfigPath();
    const config = fs.readJson(configPath);
    if (!config) {
        return config_js_1.DEFAULT_GLOBAL_CONFIG;
    }
    // 合并默认值
    return {
        ...config_js_1.DEFAULT_GLOBAL_CONFIG,
        ...config,
        suggestThreshold: {
            ...config_js_1.DEFAULT_GLOBAL_CONFIG.suggestThreshold,
            ...config.suggestThreshold,
        },
        logging: {
            ...config_js_1.DEFAULT_GLOBAL_CONFIG.logging,
            ...config.logging,
        },
        cache: {
            ...config_js_1.DEFAULT_GLOBAL_CONFIG.cache,
            ...config.cache,
        },
    };
}
/**
 * 保存全局配置
 */
function saveGlobalConfig(config) {
    const configPath = paths.getGlobalConfigPath();
    fs.ensureDir(paths.getGlobalDir());
    fs.writeJson(configPath, config);
}
/**
 * 获取项目配置
 */
function getProjectConfig(projectRoot) {
    const configPath = paths.getProjectConfigPath(projectRoot);
    if (!fs.exists(configPath)) {
        return null;
    }
    const config = fs.readJson(configPath);
    if (!config) {
        return null;
    }
    // 合并默认值
    return {
        ...config_js_1.DEFAULT_PROJECT_CONFIG,
        ...config,
        feedback: config.feedback ? {
            enabled: config.feedback.enabled ?? config_js_1.DEFAULT_PROJECT_CONFIG.feedback.enabled,
            autoRecord: config.feedback.autoRecord ?? config_js_1.DEFAULT_PROJECT_CONFIG.feedback.autoRecord,
        } : config_js_1.DEFAULT_PROJECT_CONFIG.feedback,
    };
}
/**
 * 保存项目配置
 */
function saveProjectConfig(projectRoot, config) {
    const configPath = paths.getProjectConfigPath(projectRoot);
    fs.ensureDir(paths.getProjectDir(projectRoot));
    fs.writeJson(configPath, config);
}
/**
 * 初始化项目配置
 */
function initProjectConfig(projectRoot, options) {
    const config = {
        ...config_js_1.DEFAULT_PROJECT_CONFIG,
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
function getEffectiveConfig(projectRoot) {
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
function addSource(source, scope, projectRoot) {
    if (scope === 'global') {
        const config = getGlobalConfig();
        const existingIndex = config.sources.findIndex(s => s.name === source.name);
        if (existingIndex >= 0) {
            config.sources[existingIndex] = source;
        }
        else {
            config.sources.push(source);
        }
        saveGlobalConfig(config);
    }
    else if (projectRoot) {
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
        }
        else {
            config.sources.push(source);
        }
        saveProjectConfig(projectRoot, config);
    }
}
/**
 * 移除技能源
 */
function removeSource(sourceName, scope, projectRoot) {
    if (scope === 'global') {
        const config = getGlobalConfig();
        const index = config.sources.findIndex(s => s.name === sourceName);
        if (index >= 0) {
            config.sources.splice(index, 1);
            saveGlobalConfig(config);
            return true;
        }
    }
    else if (projectRoot) {
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
function getAllSources(projectRoot) {
    const { effective } = getEffectiveConfig(projectRoot);
    return effective.sources;
}
//# sourceMappingURL=config.js.map