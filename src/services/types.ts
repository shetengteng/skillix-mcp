/**
 * 服务层类型定义
 * 
 * 包含所有被 services 使用的类型
 */

// ============================================
// 基础类型
// ============================================

/**
 * 技能范围
 */
export type SkillScope = 'global' | 'project';

/**
 * 技能元数据 (YAML frontmatter)
 */
export interface SkillMetadata {
  name: string;
  description: string;
  version?: string;
  author?: string;
  tags?: string[];
  license?: string;
}

/**
 * 技能源配置
 */
export interface SkillSource {
  name: string;
  url: string;
  branch?: string;
  default?: boolean;
}

/**
 * 技能源配置别名（兼容）
 */
export type SourceConfig = SkillSource;

// ============================================
// 配置相关类型
// ============================================

/**
 * 缓存配置
 */
export interface CacheConfig {
  enabled: boolean;
  ttl?: number;
}

/**
 * 日志配置
 */
export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  maxFiles?: number;
  maxSize?: string;
}

/**
 * 建议阈值配置
 */
export interface SuggestThreshold {
  repeatCount: number;
  stepCount: number;
}

/**
 * 反馈配置
 */
export interface FeedbackConfig {
  enabled: boolean;
  autoRecord: boolean;
}

/**
 * 全局配置 (~/.skillix/config.json)
 */
export interface GlobalConfig {
  version: string;
  sources: SkillSource[];
  defaultScope: 'global' | 'project';
  format: 'xml' | 'json';
  autoSuggest: boolean;
  suggestThreshold: SuggestThreshold;
  logging: LoggingConfig;
  cache: CacheConfig;
}

/**
 * 默认全局配置
 */
export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  version: '1.0.0',
  sources: [
    {
      name: 'official',
      url: 'https://github.com/shetengteng/skillix-hub',
      branch: 'main',
      default: true,
    },
  ],
  defaultScope: 'global',
  format: 'xml',
  autoSuggest: true,
  suggestThreshold: {
    repeatCount: 3,
    stepCount: 5,
  },
  logging: {
    level: 'info',
    maxFiles: 5,
    maxSize: '10MB',
  },
  cache: {
    enabled: true,
    ttl: 3600,
  },
};

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

// ============================================
// 技能相关类型
// ============================================

/**
 * 技能完整内容
 */
export interface Skill {
  name: string;
  description: string;
  version?: string;
  author?: string;
  tags?: string[];
  scope: SkillScope;
  path: string;
  source?: string;
  content: string;
  metadata: SkillMetadata;
  hasScripts: boolean;
  hasReferences: boolean;
  hasAssets: boolean;
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

// ============================================
// 响应相关类型
// ============================================

/**
 * 技能列表响应
 */
export interface ListSkillsResponse {
  global_skills: ListedSkill[];
  project_skills: ListedSkill[];
}
