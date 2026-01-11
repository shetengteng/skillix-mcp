/**
 * 技能创建响应数据类型定义
 */

/**
 * 技能创建响应数据
 */
export interface SkillCreateData {
  name: string;
  path: string;
  scope: string;
  files: string[];
}
