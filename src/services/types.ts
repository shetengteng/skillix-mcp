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

// ============================================
// Market 相关类型
// ============================================

/**
 * 技能源状态
 */
export type SourceStatus = 
  | 'synced'         // 已同步
  | 'syncing'        // 同步中
  | 'outdated'       // 需要更新
  | 'error'          // 同步错误
  | 'not_synced';    // 未同步

/**
 * 聚合清单
 */
export interface Manifest {
  version: string;
  updatedAt: string;
  sources: ManifestSource[];
}

/**
 * 清单中的源信息
 */
export interface ManifestSource {
  /** 源唯一标识（基于 URL 路径） */
  id: string;
  /** 用户定义的源名称（别名） */
  name: string;
  /** Git 仓库 URL */
  url: string;
  /** 分支名称 */
  branch: string;
  /** 最后同步的 commit hash */
  commit?: string;
  /** 最后同步时间 */
  syncedAt?: string;
  /** 技能数量 */
  skillCount?: number;
  /** 同步状态 */
  status: SourceStatus;
  /** 对应的索引文件路径 */
  indexFile?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 源索引
 */
export interface SourceIndex {
  version: string;
  generatedAt: string;
  source: {
    id: string;
    name: string;
    url: string;
    branch: string;
    commit: string;
  };
  skills: SkillIndexItem[];
}

/**
 * 技能索引项
 */
export interface SkillIndexItem {
  name: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
  path: string;
  hasScripts: boolean;
  hasReferences: boolean;
  hasAssets: boolean;
}

/**
 * 技能源同步结果
 */
export interface SourceSyncResult {
  id: string;
  name: string;
  url: string;
  status: SourceStatus;
  skillCount?: number;
  lastSync?: string;
  commit?: string;
  error?: string;
  newSkills?: number;
}

/**
 * 搜索结果项
 */
export interface SearchResultItem {
  name: string;
  description: string;
  version: string;
  tags: string[];
  sourceId: string;
  sourceName: string;
  author: string;
  score?: number;
}

/**
 * 安装记录
 */
export interface InstalledSkill {
  name: string;
  sourceId: string;
  sourceName: string;
  installedAt: string;
  updatedAt: string;
  path: string;
  commit?: string;
}

/**
 * 安装记录文件
 */
export interface InstalledRecord {
  version: string;
  updatedAt: string;
  skills: InstalledSkill[];
}

/**
 * URL 解析结果
 */
export interface ParsedGitUrl {
  host: string;
  owner: string;
  repo: string;
  /** 扁平化目录名 */
  dirName: string;
  /** 源 ID */
  sourceId: string;
}

// ============================================
// Market 工具响应类型
// ============================================

/**
 * 同步成功的源信息
 */
export interface SyncedSourceInfo {
  /** 源名称 */
  name: string;
  /** 技能数量 */
  skillCount?: number;
  /** 新增技能数量 */
  newSkills?: number;
}

/**
 * 同步失败的源信息
 */
export interface FailedSourceInfo {
  /** 源名称 */
  name: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 同步结果数据
 */
export interface SyncResultData {
  /** 同步成功的源列表 */
  synced: SyncedSourceInfo[];
  /** 同步失败的源列表 */
  failed: FailedSourceInfo[];
}

/**
 * 源状态详情（用于 status 响应）
 */
export interface SourceStatusInfo {
  /** 源名称 */
  name: string;
  /** 源 ID */
  id: string;
  /** Git URL */
  url?: string;
  /** 同步状态 */
  status: SourceStatus;
  /** 最后同步时间 */
  lastSync?: string;
  /** commit hash */
  commit?: string;
  /** 技能数量 */
  skillCount?: number;
  /** 缓存大小 */
  cacheSize?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 状态统计摘要
 */
export interface StatusSummary {
  /** 总数 */
  total: number;
  /** 已同步数 */
  synced: number;
  /** 错误数 */
  error: number;
  /** 未同步数 */
  notSynced: number;
}

/**
 * 状态查询结果数据
 */
export interface StatusResultData {
  /** 源状态列表 */
  sources: SourceStatusInfo[];
  /** 总缓存大小 */
  totalCacheSize: string;
  /** 统计摘要 */
  summary: StatusSummary;
}

// ============================================
// Triage 相关类型
// ============================================

/**
 * 分流操作类型
 */
export type TriageActionType =
  | 'USE_EXISTING'      // 使用现有技能
  | 'IMPROVE_EXISTING'  // 改进现有技能
  | 'CREATE_NEW'        // 创建新技能
  | 'INSTALL'           // 从市场安装
  | 'COMPOSE'           // 组合多个技能
  | 'NO_SKILL_NEEDED';  // 无需技能

/**
 * 分流配置
 */
export interface TriageConfig {
  /** 匹配阈值 (0-1) */
  matchThreshold: number;
  /** 置信度阈值 (0-1) */
  confidenceThreshold: number;
  /** 启用市场搜索 */
  enableMarketSearch: boolean;
  /** 市场搜索超时(ms) */
  marketSearchTimeout: number;
  /** 首选技能源 */
  preferredSources: string[];
}

/**
 * 默认分流配置
 */
export const DEFAULT_TRIAGE_CONFIG: TriageConfig = {
  matchThreshold: 0.5,
  confidenceThreshold: 0.7,
  enableMarketSearch: true,
  marketSearchTimeout: 5000,
  preferredSources: ['official'],
};

/**
 * 技能匹配结果
 */
export interface SkillMatch {
  /** 技能名称 */
  name: string;
  /** 技能描述 */
  description: string;
  /** 技能范围 */
  scope: SkillScope;
  /** 技能来源 */
  source: string;
  /** 匹配分数 (0-1) */
  score: number;
  /** 名称匹配分 */
  nameScore: number;
  /** 描述匹配分 */
  descriptionScore: number;
  /** 标签匹配分 */
  tagScore: number;
}

/**
 * 分流结果
 */
export interface TriageResult {
  /** 推荐操作 */
  action: TriageActionType;
  /** 推荐技能名称 */
  skill?: string;
  /** 技能来源 */
  source?: string;
  /** 置信度 (0-1) */
  confidence: number;
  /** 推荐理由 */
  reason: string;
  /** 备选方案 */
  alternatives?: TriageAlternative[];
  /** 匹配详情 */
  matchDetails?: SkillMatch[];
}

/**
 * 备选方案
 */
export interface TriageAlternative {
  /** 操作类型 */
  action: TriageActionType;
  /** 技能名称 */
  skill?: string;
  /** 来源 */
  source?: string;
  /** 置信度 */
  confidence: number;
  /** 理由 */
  reason: string;
}

