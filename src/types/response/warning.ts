/**
 * 警告响应类型定义
 */

import type { BaseResponse } from './base.js';

/**
 * 警告响应
 */
export interface WarningResponse<T = unknown> extends BaseResponse {
  status: 'warning';
  data?: T;
  warnings: string[];
}
