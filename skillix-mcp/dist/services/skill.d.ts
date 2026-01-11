/**
 * 技能服务
 * 处理技能的 CRUD 操作
 */
import type { Skill, SkillMetadata, SkillScope } from '../types/skill.js';
import type { ListedSkill, ListSkillsResponse } from '../types/response.js';
/**
 * 列出全局技能
 */
export declare function listGlobalSkills(): Skill[];
/**
 * 列出项目技能
 */
export declare function listProjectSkills(projectRoot: string): Skill[];
/**
 * 列出所有技能
 */
export declare function listAllSkills(projectRoot?: string): ListSkillsResponse;
/**
 * 获取技能详情
 */
export declare function getSkill(skillName: string, projectRoot?: string): Skill | null;
/**
 * 读取技能内容
 */
export declare function readSkillContent(skillName: string, projectRoot?: string): {
    metadata: SkillMetadata;
    body: string;
    scripts?: string[];
    references?: string[];
    assets?: string[];
} | null;
/**
 * 创建技能
 */
export declare function createSkill(skillName: string, metadata: SkillMetadata, body: string, scope: SkillScope, projectRoot?: string): Skill;
/**
 * 更新技能
 */
export declare function updateSkill(skillName: string, updates: {
    metadata?: Partial<SkillMetadata>;
    body?: string;
}, projectRoot?: string): Skill | null;
/**
 * 删除技能
 */
export declare function deleteSkill(skillName: string, projectRoot?: string): boolean;
/**
 * 检查技能是否存在
 */
export declare function skillExists(skillName: string, projectRoot?: string): boolean;
/**
 * 搜索技能
 */
export declare function searchSkills(query: string, projectRoot?: string): ListedSkill[];
//# sourceMappingURL=skill.d.ts.map