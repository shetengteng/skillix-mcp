/**
 * sx_skill 工具
 * 本地技能管理：list, read, create, update, delete
 */
import type { ToolResponse } from '../types/response.js';
import type { SkillMetadata, SkillScope } from '../types/skill.js';
/**
 * sx_skill 工具参数
 */
export interface SxSkillParams {
    action: 'list' | 'read' | 'create' | 'update' | 'delete';
    name?: string;
    scope?: SkillScope;
    projectRoot?: string;
    metadata?: SkillMetadata;
    body?: string;
    query?: string;
}
/**
 * sx_skill 工具主入口
 */
export declare function sxSkill(params: SxSkillParams): ToolResponse;
/**
 * 工具定义（用于 MCP 注册）
 */
export declare const sxSkillDefinition: {
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
            name: {
                type: string;
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
            metadata: {
                type: string;
                description: string;
                properties: {
                    name: {
                        type: string;
                    };
                    description: {
                        type: string;
                    };
                    version: {
                        type: string;
                    };
                    author: {
                        type: string;
                    };
                    tags: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
            };
            body: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
//# sourceMappingURL=sx_skill.d.ts.map