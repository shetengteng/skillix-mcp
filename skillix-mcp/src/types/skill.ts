/**
 * 技能相关类型定义
 */

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
 * 技能信息
 */
export interface SkillInfo {
  name: string;
  description: string;
  version?: string;
  author?: string;
  tags?: string[];
  scope: SkillScope;
  path: string;
  source?: string;
}

/**
 * 技能完整内容
 */
export interface Skill extends SkillInfo {
  content: string;
  metadata: SkillMetadata;
  hasScripts: boolean;
  hasReferences: boolean;
  hasAssets: boolean;
}

/**
 * 技能创建参数
 */
export interface CreateSkillParams {
  name: string;
  description: string;
  content: string;
  scope?: SkillScope;
  version?: string;
  author?: string;
  tags?: string[];
}

/**
 * 技能更新参数
 */
export interface UpdateSkillParams {
  name: string;
  scope?: SkillScope;
  description?: string;
  content?: string;
  version?: string;
  tags?: string[];
}

/**
 * 技能列表过滤参数
 */
export interface ListSkillsParams {
  scope?: SkillScope | 'all';
}

/**
 * 技能读取参数
 */
export interface ReadSkillParams {
  name: string;
  scope?: SkillScope | 'auto';
}

/**
 * 技能删除参数
 */
export interface DeleteSkillParams {
  name: string;
  scope?: SkillScope;
}
