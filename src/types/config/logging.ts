/**
 * 日志配置类型定义
 */

/**
 * 日志配置
 */
export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  maxFiles?: number;
  maxSize?: string;
}
