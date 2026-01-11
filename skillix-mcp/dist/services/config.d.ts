/**
 * 配置服务
 * 处理全局和项目级配置的读写
 */
import type { GlobalConfig, ProjectConfig, SourceConfig } from '../types/config.js';
/**
 * 获取全局配置
 */
export declare function getGlobalConfig(): GlobalConfig;
/**
 * 保存全局配置
 */
export declare function saveGlobalConfig(config: GlobalConfig): void;
/**
 * 获取项目配置
 */
export declare function getProjectConfig(projectRoot: string): ProjectConfig | null;
/**
 * 保存项目配置
 */
export declare function saveProjectConfig(projectRoot: string, config: ProjectConfig): void;
/**
 * 初始化项目配置
 */
export declare function initProjectConfig(projectRoot: string, options?: Partial<ProjectConfig>): ProjectConfig;
/**
 * 获取有效配置（本地优先策略）
 * 项目配置优先，不存在则使用全局配置
 */
export declare function getEffectiveConfig(projectRoot?: string): {
    global: GlobalConfig;
    project: ProjectConfig | null;
    effective: {
        sources: SourceConfig[];
        format: 'xml' | 'json';
        autoSuggest: boolean;
    };
};
/**
 * 添加技能源
 */
export declare function addSource(source: SourceConfig, scope: 'global' | 'project', projectRoot?: string): void;
/**
 * 移除技能源
 */
export declare function removeSource(sourceName: string, scope: 'global' | 'project', projectRoot?: string): boolean;
/**
 * 获取所有技能源
 */
export declare function getAllSources(projectRoot?: string): SourceConfig[];
//# sourceMappingURL=config.d.ts.map