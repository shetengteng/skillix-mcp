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
export const ErrorCodes = {
  // 参数错误
  E001: 'E001', // 参数缺失
  E002: 'E002', // 名称无效
  E003: 'E003', // 描述无效
  
  // 技能错误
  E004: 'E004', // 技能已存在
  E005: 'E005', // 技能不存在
  E006: 'E006', // 写入失败
  E007: 'E007', // 验证失败
  
  // 配置错误
  E010: 'E010', // 配置不存在
  E011: 'E011', // 配置格式错误
  
  // 系统错误
  E099: 'E099', // 未知错误
} as const;

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
