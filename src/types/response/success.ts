/**
 * 成功响应类型定义
 */

import type { BaseResponse } from './base.js';

/**
 * 成功响应
 */
export interface SuccessResponse<T = unknown> extends BaseResponse {
  status: 'success';
  data?: T;
}
