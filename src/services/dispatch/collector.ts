/**
 * 技能收集器
 * 
 * 负责从本地和市场收集技能信息
 */

import type { ListSkillsResponse, SkillInfo } from '../types.js';
import { listAllSkills, getSkill } from '../skill/index.js';
import { searchSkills, loadManifest, syncAllSources } from '../market/index.js';

/**
 * 收集本地技能信息（包含 tags）
 */
export function collectLocalSkills(projectRoot?: string): SkillInfo[] {
  let localSkills: ListSkillsResponse;
  try {
    localSkills = listAllSkills(projectRoot);
  } catch {
    return [];
  }

  const skills: SkillInfo[] = [];

  // 项目级技能
  for (const skill of localSkills.project_skills) {
    // 尝试获取完整技能信息以获取 tags
    let tags: string[] | undefined;
    try {
      // getSkill 会先查找项目级再查找全局级
      const fullSkill = getSkill(skill.name, projectRoot);
      tags = fullSkill?.metadata?.tags;
    } catch {
      // 忽略错误，tags 保持 undefined
    }
    
    skills.push({
      name: skill.name,
      description: skill.description,
      source: skill.source,
      scope: 'project',
      tags,
    });
  }

  // 全局技能
  for (const skill of localSkills.global_skills) {
    // 尝试获取完整技能信息以获取 tags
    let tags: string[] | undefined;
    try {
      // 全局技能不传 projectRoot
      const fullSkill = getSkill(skill.name);
      tags = fullSkill?.metadata?.tags;
    } catch {
      // 忽略错误，tags 保持 undefined
    }
    
    skills.push({
      name: skill.name,
      description: skill.description,
      source: skill.source,
      scope: 'global',
      tags,
    });
  }

  return skills;
}

/**
 * 收集市场技能信息（包含 tags）
 */
export function collectMarketSkills(task: string, limit: number = 10): SkillInfo[] {
  try {
    // 确保有缓存
    const manifest = loadManifest();
    if (!manifest || manifest.sources.length === 0) {
      syncAllSources();
    }

    // 搜索市场（使用任务描述作为查询）
    const result = searchSkills({
      query: task,
      limit,
    });

    return result.results.map(r => ({
      name: r.name,
      description: r.description,
      source: r.sourceName,
      scope: 'market' as const,
      tags: r.tags,
    }));
  } catch {
    return [];
  }
}
