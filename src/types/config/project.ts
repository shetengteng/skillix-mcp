/**
 * 项目配置类型定义
 */

import type { SkillSource } from './source.js';
import type { FeedbackConfig } from './feedback.js';

/**
 * 项目配置 (.skillix/config.json)
 */
export interface ProjectConfig {
  sources?: SkillSource[];
  format?: 'xml' | 'json';
  autoSuggest?: boolean;
  feedback?: FeedbackConfig;
}

/**
 * 默认项目配置
 */
export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  sources: [],
  format: 'xml',
  autoSuggest: true,
  feedback: {
    enabled: true,
    autoRecord: false,
  },
};
