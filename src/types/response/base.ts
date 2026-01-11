/**
 * 基础响应类型定义
 */

import type { ResultStatus } from './status.js';

/**
 * 基础响应
 */
export interface BaseResponse {
  status: ResultStatus;
  message?: string;
}
