/**
 * 技能源配置类型定义
 */

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
