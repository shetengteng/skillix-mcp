/**
 * sx_config 工具
 * 配置管理：get, set, init, sources
 */
import type { ToolResponse } from '../types/response.js';
import type { SourceConfig } from '../types/config.js';
/**
 * sx_config 工具参数
 */
export interface SxConfigParams {
    action: 'get' | 'set' | 'init' | 'sources';
    scope?: 'global' | 'project';
    projectRoot?: string;
    key?: string;
    value?: any;
    sourceAction?: 'list' | 'add' | 'remove';
    source?: SourceConfig;
    sourceName?: string;
}
/**
 * sx_config 工具主入口
 */
export declare function sxConfig(params: SxConfigParams): ToolResponse;
/**
 * 工具定义（用于 MCP 注册）
 */
export declare const sxConfigDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            action: {
                type: string;
                enum: string[];
                description: string;
            };
            scope: {
                type: string;
                enum: string[];
                description: string;
            };
            projectRoot: {
                type: string;
                description: string;
            };
            key: {
                type: string;
                description: string;
            };
            value: {
                description: string;
            };
            sourceAction: {
                type: string;
                enum: string[];
                description: string;
            };
            source: {
                type: string;
                description: string;
                properties: {
                    name: {
                        type: string;
                    };
                    url: {
                        type: string;
                    };
                    branch: {
                        type: string;
                    };
                    default: {
                        type: string;
                    };
                };
            };
            sourceName: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
//# sourceMappingURL=sx_config.d.ts.map