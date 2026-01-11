/**
 * 工具响应类型定义
 */

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
