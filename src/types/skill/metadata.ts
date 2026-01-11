/**
 * 技能元数据类型定义
 */

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
