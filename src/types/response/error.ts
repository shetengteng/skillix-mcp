/**
 * 错误响应类型定义
 */

import type { BaseResponse } from './base.js';

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
