"use strict";
/**
 * sx_config 工具
 * 配置管理：get, set, init, sources
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sxConfigDefinition = void 0;
exports.sxConfig = sxConfig;
const index_js_1 = require("../services/index.js");
/**
 * 获取配置
 */
function handleGet(params) {
    const { scope, projectRoot, key } = params;
    try {
        if (scope === 'project') {
            if (!projectRoot) {
                return {
                    success: false,
                    message: '获取项目配置需要指定项目根目录',
                    errors: ['参数 projectRoot 是必需的'],
                };
            }
            const config = index_js_1.configService.getProjectConfig(projectRoot);
            if (!config) {
                return {
                    success: false,
                    message: '项目配置不存在',
                    errors: ['请先使用 init 操作初始化项目配置'],
                };
            }
            if (key) {
                const value = config[key];
                return {
                    success: true,
                    message: `项目配置 ${key}`,
                    data: { [key]: value },
                };
            }
            return {
                success: true,
                message: '项目配置',
                data: config,
            };
        }
        // 默认获取全局配置
        const config = index_js_1.configService.getGlobalConfig();
        if (key) {
            const value = config[key];
            return {
                success: true,
                message: `全局配置 ${key}`,
                data: { [key]: value },
            };
        }
        return {
            success: true,
            message: '全局配置',
            data: config,
        };
    }
    catch (error) {
        return {
            success: false,
            message: '获取配置失败',
            errors: [error instanceof Error ? error.message : String(error)],
        };
    }
}
/**
 * 设置配置
 */
function handleSet(params) {
    const { scope, projectRoot, key, value } = params;
    if (!key) {
        return {
            success: false,
            message: '缺少配置键',
            errors: ['参数 key 是必需的'],
        };
    }
    if (value === undefined) {
        return {
            success: false,
            message: '缺少配置值',
            errors: ['参数 value 是必需的'],
        };
    }
    try {
        if (scope === 'project') {
            if (!projectRoot) {
                return {
                    success: false,
                    message: '设置项目配置需要指定项目根目录',
                    errors: ['参数 projectRoot 是必需的'],
                };
            }
            let config = index_js_1.configService.getProjectConfig(projectRoot);
            if (!config) {
                config = index_js_1.configService.initProjectConfig(projectRoot);
            }
            config[key] = value;
            index_js_1.configService.saveProjectConfig(projectRoot, config);
            return {
                success: true,
                message: `成功设置项目配置 ${key}`,
                data: { [key]: value },
            };
        }
        // 默认设置全局配置
        const config = index_js_1.configService.getGlobalConfig();
        config[key] = value;
        index_js_1.configService.saveGlobalConfig(config);
        return {
            success: true,
            message: `成功设置全局配置 ${key}`,
            data: { [key]: value },
        };
    }
    catch (error) {
        return {
            success: false,
            message: '设置配置失败',
            errors: [error instanceof Error ? error.message : String(error)],
        };
    }
}
/**
 * 初始化项目配置
 */
function handleInit(params) {
    const { projectRoot } = params;
    if (!projectRoot) {
        return {
            success: false,
            message: '初始化项目配置需要指定项目根目录',
            errors: ['参数 projectRoot 是必需的'],
        };
    }
    try {
        // 检查是否已存在
        const existingConfig = index_js_1.configService.getProjectConfig(projectRoot);
        if (existingConfig) {
            return {
                success: true,
                message: '项目配置已存在',
                data: existingConfig,
                warnings: ['项目配置已存在，未进行覆盖'],
            };
        }
        const config = index_js_1.configService.initProjectConfig(projectRoot);
        return {
            success: true,
            message: '成功初始化项目配置',
            data: config,
        };
    }
    catch (error) {
        return {
            success: false,
            message: '初始化项目配置失败',
            errors: [error instanceof Error ? error.message : String(error)],
        };
    }
}
/**
 * 管理技能源
 */
function handleSources(params) {
    const { sourceAction = 'list', scope = 'global', projectRoot, source, sourceName } = params;
    try {
        switch (sourceAction) {
            case 'list': {
                const sources = index_js_1.configService.getAllSources(projectRoot);
                return {
                    success: true,
                    message: `找到 ${sources.length} 个技能源`,
                    data: sources,
                };
            }
            case 'add': {
                if (!source) {
                    return {
                        success: false,
                        message: '添加技能源需要提供源配置',
                        errors: ['参数 source 是必需的'],
                    };
                }
                if (!source.name || !source.url) {
                    return {
                        success: false,
                        message: '技能源配置不完整',
                        errors: ['source.name 和 source.url 是必需的'],
                    };
                }
                if (scope === 'project' && !projectRoot) {
                    return {
                        success: false,
                        message: '添加项目级技能源需要指定项目根目录',
                        errors: ['参数 projectRoot 是必需的'],
                    };
                }
                index_js_1.configService.addSource(source, scope, projectRoot);
                return {
                    success: true,
                    message: `成功添加技能源 "${source.name}"`,
                    data: source,
                };
            }
            case 'remove': {
                if (!sourceName) {
                    return {
                        success: false,
                        message: '删除技能源需要提供源名称',
                        errors: ['参数 sourceName 是必需的'],
                    };
                }
                if (scope === 'project' && !projectRoot) {
                    return {
                        success: false,
                        message: '删除项目级技能源需要指定项目根目录',
                        errors: ['参数 projectRoot 是必需的'],
                    };
                }
                const success = index_js_1.configService.removeSource(sourceName, scope, projectRoot);
                if (!success) {
                    return {
                        success: false,
                        message: `技能源 "${sourceName}" 不存在`,
                        errors: [`未找到名为 "${sourceName}" 的技能源`],
                    };
                }
                return {
                    success: true,
                    message: `成功删除技能源 "${sourceName}"`,
                };
            }
            default:
                return {
                    success: false,
                    message: `未知的源操作: ${sourceAction}`,
                    errors: ['支持的操作: list, add, remove'],
                };
        }
    }
    catch (error) {
        return {
            success: false,
            message: '管理技能源失败',
            errors: [error instanceof Error ? error.message : String(error)],
        };
    }
}
/**
 * sx_config 工具主入口
 */
function sxConfig(params) {
    const { action } = params;
    switch (action) {
        case 'get':
            return handleGet(params);
        case 'set':
            return handleSet(params);
        case 'init':
            return handleInit(params);
        case 'sources':
            return handleSources(params);
        default:
            return {
                success: false,
                message: `未知操作: ${action}`,
                errors: ['支持的操作: get, set, init, sources'],
            };
    }
}
/**
 * 工具定义（用于 MCP 注册）
 */
exports.sxConfigDefinition = {
    name: 'sx_config',
    description: '配置管理工具，支持获取、设置配置和管理技能源',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['get', 'set', 'init', 'sources'],
                description: '操作类型',
            },
            scope: {
                type: 'string',
                enum: ['global', 'project'],
                description: '配置范围（默认 global）',
            },
            projectRoot: {
                type: 'string',
                description: '项目根目录路径（项目级操作时需要）',
            },
            key: {
                type: 'string',
                description: '配置键（get/set 时使用）',
            },
            value: {
                description: '配置值（set 时使用）',
            },
            sourceAction: {
                type: 'string',
                enum: ['list', 'add', 'remove'],
                description: '源操作类型（sources 时使用）',
            },
            source: {
                type: 'object',
                description: '技能源配置（sources add 时使用）',
                properties: {
                    name: { type: 'string' },
                    url: { type: 'string' },
                    branch: { type: 'string' },
                    default: { type: 'boolean' },
                },
            },
            sourceName: {
                type: 'string',
                description: '技能源名称（sources remove 时使用）',
            },
        },
        required: ['action'],
    },
};
//# sourceMappingURL=sx_config.js.map