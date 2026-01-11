/**
 * 响应相关类型定义
 */
/**
 * 操作结果状态
 */
export type ResultStatus = 'success' | 'error' | 'warning';
/**
 * 基础响应
 */
export interface BaseResponse {
    status: ResultStatus;
    message?: string;
}
/**
 * 成功响应
 */
export interface SuccessResponse<T = unknown> extends BaseResponse {
    status: 'success';
    data?: T;
}
/**
 * 错误响应
 */
export interface ErrorResponse extends BaseResponse {
    status: 'error';
    error: {
        code: string;
        message: string;
        details?: string;
    };
}
/**
 * 警告响应
 */
export interface WarningResponse<T = unknown> extends BaseResponse {
    status: 'warning';
    data?: T;
    warnings: string[];
}
/**
 * 技能列表响应数据
 */
export interface SkillListData {
    globalSkills: Array<{
        name: string;
        description: string;
        source?: string;
    }>;
    projectSkills: Array<{
        name: string;
        description: string;
        source?: string;
    }>;
}
/**
 * 技能创建响应数据
 */
export interface SkillCreateData {
    name: string;
    path: string;
    scope: string;
    files: string[];
}
/**
 * 初始化响应数据
 */
export interface InitData {
    skillixDir: string;
    configFile: string;
    skillsDir: string;
    logsDir: string;
}
/**
 * 错误码定义
 */
export declare const ErrorCodes: {
    readonly E001: "E001";
    readonly E002: "E002";
    readonly E003: "E003";
    readonly E004: "E004";
    readonly E005: "E005";
    readonly E006: "E006";
    readonly E007: "E007";
    readonly E010: "E010";
    readonly E011: "E011";
    readonly E099: "E099";
};
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
/**
 * 工具响应（兼容旧接口）
 */
export interface ToolResponse {
    success: boolean;
    message: string;
    data?: unknown;
    errors?: string[];
    warnings?: string[];
}
/**
 * 列出的技能项
 */
export interface ListedSkill {
    name: string;
    description: string;
    source: string;
    path?: string;
}
/**
 * 技能列表响应
 */
export interface ListSkillsResponse {
    global_skills: ListedSkill[];
    project_skills: ListedSkill[];
}
//# sourceMappingURL=response.d.ts.map