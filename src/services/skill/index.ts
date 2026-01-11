/**
 * 技能服务
 * 统一导出所有技能相关功能
 */

// 类型导出
export type { Skill, ListedSkill, SkillMetadata, SkillScope, ListSkillsResponse } from '../types.js';

// 内部工具函数
export { loadSkillFromDir } from './load.js';

// 列表功能
export { listGlobalSkills, listProjectSkills, listAllSkills } from './list.js';

// 获取功能
export { getSkill } from './get.js';

// 读取功能
export { readSkillContent } from './read.js';

// 创建功能
export { createSkill } from './create.js';

// 更新功能
export { updateSkill } from './update.js';

// 删除功能
export { deleteSkill } from './delete.js';

// 检查存在
export { skillExists } from './exists.js';

// 搜索功能
export { searchSkills } from './search.js';
