/**
 * 分流分析服务
 * 
 * AI First 设计理念：
 * - triage 工具负责收集技能信息
 * - 将任务和技能信息返回给 AI
 * - AI 自行判断最佳匹配和推荐操作
 * 
 * 这种设计充分利用了 AI 的理解能力，避免了硬编码的关键词匹配
 */

import type {
  TriageResult,
  SkillMatch,
  TriageConfig,
  ListSkillsResponse,
} from '../types.js';
import { listAllSkills } from '../skill/index.js';
import { searchSkills, loadManifest, syncAllSources } from '../market/index.js';

/**
 * 分流分析参数
 */
export interface AnalyzeParams {
  /** 任务描述 */
  task: string;
  /** 上下文信息 */
  context?: string;
  /** 提示词列表 */
  hints?: string[];
  /** 项目根目录 */
  projectRoot?: string;
  /** 分流配置 */
  config?: Partial<TriageConfig>;
}

/**
 * 技能信息（简化版，用于 AI 分析）
 */
interface SkillInfo {
  name: string;
  description: string;
  source: string;
  scope: 'global' | 'project' | 'market';
}

/**
 * 收集本地技能信息
 */
function collectLocalSkills(projectRoot?: string): SkillInfo[] {
  let localSkills: ListSkillsResponse;
  try {
    localSkills = listAllSkills(projectRoot);
  } catch {
    return [];
  }

  const skills: SkillInfo[] = [];

  // 项目级技能
  for (const skill of localSkills.project_skills) {
    skills.push({
      name: skill.name,
      description: skill.description,
      source: skill.source,
      scope: 'project',
    });
  }

  // 全局技能
  for (const skill of localSkills.global_skills) {
    skills.push({
      name: skill.name,
      description: skill.description,
      source: skill.source,
      scope: 'global',
    });
  }

  return skills;
}

/**
 * 收集市场技能信息
 */
function collectMarketSkills(task: string, limit: number = 10): SkillInfo[] {
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
    }));
  } catch {
    return [];
  }
}

/**
 * 简单的字符串匹配分数
 * 用于初步排序，最终判断交给 AI
 */
function calculateSimpleScore(task: string, skill: SkillInfo): number {
  const taskLower = task.toLowerCase();
  const nameLower = skill.name.toLowerCase();
  const descLower = skill.description.toLowerCase();

  let score = 0;

  // 名称完全包含
  if (taskLower.includes(nameLower) || nameLower.includes(taskLower.split(' ')[0])) {
    score += 0.5;
  }

  // 名称部分匹配（按连字符分割）
  const nameParts = nameLower.split('-');
  for (const part of nameParts) {
    if (part.length >= 2 && taskLower.includes(part)) {
      score += 0.2;
    }
  }

  // 描述包含任务关键词
  const taskWords = taskLower.split(/\s+/).filter(w => w.length >= 2);
  for (const word of taskWords) {
    if (descLower.includes(word)) {
      score += 0.1;
    }
  }

  return Math.min(1, score);
}

/**
 * 分流分析
 * 
 * 返回任务信息和可用技能列表，供 AI 分析决策
 */
export function analyze(params: AnalyzeParams): TriageResult {
  const { task, projectRoot, config } = params;

  // 合并配置
  const enableMarketSearch = config?.enableMarketSearch ?? true;

  // 1. 收集本地技能
  const localSkills = collectLocalSkills(projectRoot);

  // 2. 收集市场技能（如果启用）
  const marketSkills = enableMarketSearch ? collectMarketSkills(task, 10) : [];

  // 3. 合并所有技能并计算简单分数
  const allSkills = [...localSkills, ...marketSkills];
  
  const scoredSkills: Array<SkillInfo & { score: number }> = allSkills.map(skill => ({
    ...skill,
    score: calculateSimpleScore(task, skill),
  }));

  // 按分数排序
  scoredSkills.sort((a, b) => b.score - a.score);

  // 4. 构建匹配详情
  const matchDetails: SkillMatch[] = scoredSkills.slice(0, 10).map(skill => ({
    name: skill.name,
    description: skill.description,
    scope: skill.scope === 'market' ? 'global' : skill.scope,
    source: skill.source,
    score: skill.score,
    nameScore: skill.score,
    descriptionScore: skill.score,
    tagScore: 0,
  }));

  // 5. 判断推荐操作
  // 注意：这只是初步判断，最终决策应由 AI 根据返回的信息自行判断
  
  // 没有任何技能
  if (allSkills.length === 0) {
    return {
      action: 'CREATE_NEW',
      confidence: 0.7,
      reason: '未找到任何可用技能，建议创建新技能',
      matchDetails: [],
    };
  }

  const bestMatch = scoredSkills[0];

  // 本地有高分匹配
  if (bestMatch && bestMatch.score >= 0.5 && bestMatch.scope !== 'market') {
    return {
      action: 'USE_EXISTING',
      skill: bestMatch.name,
      source: bestMatch.source,
      confidence: Math.min(0.9, bestMatch.score + 0.2),
      reason: `找到可能匹配的本地技能 "${bestMatch.name}"，请 AI 确认是否适用`,
      matchDetails,
    };
  }

  // 市场有高分匹配
  if (bestMatch && bestMatch.score >= 0.3 && bestMatch.scope === 'market') {
    return {
      action: 'INSTALL',
      skill: bestMatch.name,
      source: bestMatch.source,
      confidence: Math.min(0.8, bestMatch.score + 0.1),
      reason: `在技能市场找到可能匹配的技能 "${bestMatch.name}"，请 AI 确认是否需要安装`,
      matchDetails,
    };
  }

  // 有一些匹配但分数不高
  if (matchDetails.length > 0) {
    return {
      action: 'CREATE_NEW',
      confidence: 0.5,
      reason: '找到一些相关技能但匹配度不高，建议 AI 评估是否需要创建新技能或使用现有技能',
      matchDetails,
    };
  }

  // 默认：创建新技能
  return {
    action: 'CREATE_NEW',
    confidence: 0.6,
    reason: '未找到明确匹配的技能，建议创建新技能',
    matchDetails: [],
  };
}
