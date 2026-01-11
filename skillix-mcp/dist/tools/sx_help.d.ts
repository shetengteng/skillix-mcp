/**
 * sx_help 工具
 * 帮助信息和使用指南
 */
import type { ToolResponse } from '../types/response.js';
/**
 * sx_help 工具参数
 */
export interface SxHelpParams {
    topic?: 'overview' | 'skill' | 'config' | 'market' | 'triage' | 'all';
}
/**
 * sx_help 工具主入口
 */
export declare function sxHelp(params: SxHelpParams): ToolResponse;
/**
 * 工具定义（用于 MCP 注册）
 */
export declare const sxHelpDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            topic: {
                type: string;
                enum: string[];
                description: string;
            };
        };
    };
};
//# sourceMappingURL=sx_help.d.ts.map