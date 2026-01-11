/**
 * 技能列表响应数据类型定义
 */

/**
 * 技能列表响应数据
 */
export interface SkillListData {
  globalSkills: Array<{
    name: string;
    description: string;
    source?: string;
  }>;
  projectSkills: Array<{
    name: string;
    description: string;
    source?: string;
  }>;
}
