/**
 * 工具响应构建器
 * 提供统一的 ToolResponse 创建方法
 */

import type { ToolResponse } from '../tools/types.js';

/**
 * 成功响应选项
 */
export interface SuccessOptions {
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data?: unknown;
  /** 警告信息 */
  warnings?: string[];
}

/**
 * 失败响应选项
 */
export interface ErrorOptions {
  /** 响应消息 */
  message: string;
  /** 错误信息列表 */
  errors?: string[];
}

/**
 * 创建成功响应
 * 
 * @example
 * ```typescript
 * return success({
 *   message: `找到 ${total} 个技能`,
 *   data: { total, results },
 * });
 * ```
 */
export function success(options: SuccessOptions): ToolResponse {
  const response: ToolResponse = {
    success: true,
    message: options.message,
  };

  if (options.data !== undefined) {
    response.data = options.data;
  }

  if (options.warnings && options.warnings.length > 0) {
    response.warnings = options.warnings;
  }

  return response;
}

/**
 * 创建失败响应
 * 
 * @example
 * ```typescript
 * return error({
 *   message: '缺少技能名称',
 *   errors: ['参数 name 是必需的'],
 * });
 * ```
 */
export function error(options: ErrorOptions): ToolResponse {
  const response: ToolResponse = {
    success: false,
    message: options.message,
  };

  if (options.errors && options.errors.length > 0) {
    response.errors = options.errors;
  }

  return response;
}

/**
 * 从异常创建失败响应
 * 
 * @example
 * ```typescript
 * try {
 *   // ...
 * } catch (e) {
 *   return errorFromException('创建技能失败', e);
 * }
 * ```
 */
export function errorFromException(message: string, e: unknown): ToolResponse {
  return error({
    message,
    errors: [e instanceof Error ? e.message : String(e)],
  });
}
