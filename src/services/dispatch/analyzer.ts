/**
 * 分流分析服务
 * 
 * 混合方案设计：
 * - 层级 1：Cursor Rule 引导 AI 何时调用 sx-dispatch
 * - 层级 2：sx-dispatch 智能分流（本模块）
 * - 层级 3：Skill Description 匹配
 * 
 * AI First 设计理念：
 * - dispatch 工具负责收集技能信息
 * - 使用多维度匹配算法提供初步建议
 * - 最终决策由 AI 根据返回信息自行判断
 */

import type { DispatchResult, SkillMatch, AnalyzeParams, ScoredSkill, UpdateSuggestion, UpdateSuggestionReason } from '../types.js';
import { collectLocalSkills, collectMarketSkills } from './collector.js';
import { calculateMatchScore, extractKeywords } from './matcher.js';

// 导出类型
export type { AnalyzeParams } from '../types.js';

// 导出领域同义词（供外部使用）
export { DOMAIN_SYNONYMS } from './synonyms.js';

/**
 * 生成更新建议
 * 
 * 分析任务和技能的差异，生成具体的更新建议
 */
function generateUpdateSuggestion(task: string, skill: ScoredSkill): UpdateSuggestion {
  const { scoreDetails } = skill;
  const suggestedChanges: string[] = [];
  const missingFeatures: string[] = [];
  
  // 提取任务关键词
  const taskKeywords = extractKeywords(task);
  const skillKeywords = extractKeywords(`${skill.name} ${skill.description}`);
  
  // 找出未匹配的关键词（任务中有但技能没有的）
  const unmatchedKeywords = taskKeywords.filter(
    keyword => !skillKeywords.some(sk => 
      sk.includes(keyword) || keyword.includes(sk)
    )
  );
  
  // 确定主要原因
  let reason: UpdateSuggestionReason = 'partial_match';
  
  // 分析各维度得分，生成针对性建议
  if (scoreDetails.descriptionScore < 0.3) {
    reason = 'low_description_match';
    suggestedChanges.push('更新技能描述，添加更多相关关键词以提高匹配度');
    
    if (unmatchedKeywords.length > 0) {
      suggestedChanges.push(`考虑在描述中添加以下关键词: ${unmatchedKeywords.slice(0, 5).join(', ')}`);
    }
  }
  
  if (scoreDetails.tagScore < 0.2 && skill.tags && skill.tags.length > 0) {
    if (reason === 'partial_match') {
      reason = 'low_tag_match';
    }
    suggestedChanges.push('更新技能标签，添加更相关的标签以提高发现率');
    
    if (unmatchedKeywords.length > 0) {
      const suggestedTags = unmatchedKeywords.slice(0, 3);
      suggestedChanges.push(`建议添加标签: ${suggestedTags.join(', ')}`);
    }
  }
  
  if (scoreDetails.nameScore < 0.5 && scoreDetails.descriptionScore < 0.5) {
    reason = 'missing_feature';
    suggestedChanges.push('技能可能缺少任务所需的功能，考虑扩展技能内容');
    
    // 从未匹配的关键词中提取可能缺失的功能
    if (unmatchedKeywords.length > 0) {
      missingFeatures.push(...unmatchedKeywords.slice(0, 5));
    }
  }
  
  // 如果没有具体建议，添加通用建议
  if (suggestedChanges.length === 0) {
    suggestedChanges.push('检查技能内容是否涵盖任务需求');
    suggestedChanges.push('考虑添加更详细的使用说明');
  }
  
  // 添加通用的更新建议
  suggestedChanges.push('先读取技能内容: sx-skill action=read name="' + skill.name + '"');
  suggestedChanges.push('分析差距后使用 sx-skill action=update 更新技能');
  
  return {
    reason,
    confidence: scoreDetails.total,
    suggestedChanges,
    missingFeatures: missingFeatures.length > 0 ? missingFeatures : undefined,
    matchedKeywords: scoreDetails.matchedKeywords.length > 0 ? scoreDetails.matchedKeywords : undefined,
    unmatchedKeywords: unmatchedKeywords.length > 0 ? unmatchedKeywords : undefined,
  };
}

/**
 * 分流分析
 * 
 * 返回任务信息和可用技能列表，供 AI 分析决策
 * 使用多维度匹配算法提供更准确的建议
 */
export function analyze(params: AnalyzeParams): DispatchResult {
  const { task, projectRoot, config } = params;

  // 合并配置
  const enableMarketSearch = config?.enableMarketSearch ?? true;
  const matchThreshold = config?.matchThreshold ?? 0.5;
  const confidenceThreshold = config?.confidenceThreshold ?? 0.7;

  // 1. 收集本地技能
  const localSkills = collectLocalSkills(projectRoot);

  // 2. 收集市场技能（如果启用）
  const marketSkills = enableMarketSearch ? collectMarketSkills(task, 10) : [];

  // 3. 合并所有技能并计算多维度匹配分数
  const allSkills = [...localSkills, ...marketSkills];
  
  const scoredSkills: ScoredSkill[] = allSkills.map(skill => ({
    ...skill,
    scoreDetails: calculateMatchScore(task, skill),
  }));

  // 按总分排序
  scoredSkills.sort((a, b) => b.scoreDetails.total - a.scoreDetails.total);

  // 4. 构建匹配详情（包含详细分数）
  const matchDetails: SkillMatch[] = scoredSkills.slice(0, 10).map(skill => ({
    name: skill.name,
    description: skill.description,
    scope: skill.scope === 'market' ? 'global' : skill.scope,
    source: skill.source,
    score: skill.scoreDetails.total,
    nameScore: skill.scoreDetails.nameScore,
    descriptionScore: skill.scoreDetails.descriptionScore,
    tagScore: skill.scoreDetails.tagScore,
    // 扩展字段
    ...(skill.scoreDetails.matchedKeywords.length > 0 && {
      matchedKeywords: skill.scoreDetails.matchedKeywords,
    }),
    ...(skill.scoreDetails.matchedDomains.length > 0 && {
      matchedDomains: skill.scoreDetails.matchedDomains,
    }),
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
  const bestScore = bestMatch?.scoreDetails.total ?? 0;

  // 高分匹配 (>= 0.7)
  if (bestMatch && bestScore >= confidenceThreshold) {
    if (bestMatch.scope !== 'market') {
      return {
        action: 'USE_EXISTING',
        skill: bestMatch.name,
        source: bestMatch.source,
        confidence: Math.min(0.95, bestScore + 0.1),
        reason: `找到高度匹配的本地技能 "${bestMatch.name}"（匹配度: ${(bestScore * 100).toFixed(0)}%）`,
        matchDetails,
      };
    } else {
      return {
        action: 'INSTALL',
        skill: bestMatch.name,
        source: bestMatch.source,
        confidence: Math.min(0.9, bestScore),
        reason: `在技能市场找到高度匹配的技能 "${bestMatch.name}"（匹配度: ${(bestScore * 100).toFixed(0)}%）`,
        matchDetails,
      };
    }
  }

  // 中等匹配 (>= 0.5)
  if (bestMatch && bestScore >= matchThreshold) {
    if (bestMatch.scope !== 'market') {
      return {
        action: 'USE_EXISTING',
        skill: bestMatch.name,
        source: bestMatch.source,
        confidence: bestScore,
        reason: `找到可能匹配的本地技能 "${bestMatch.name}"（匹配度: ${(bestScore * 100).toFixed(0)}%），请确认是否适用`,
        matchDetails,
      };
    } else {
      return {
        action: 'INSTALL',
        skill: bestMatch.name,
        source: bestMatch.source,
        confidence: bestScore,
        reason: `在技能市场找到可能匹配的技能 "${bestMatch.name}"（匹配度: ${(bestScore * 100).toFixed(0)}%），请确认是否需要安装`,
        matchDetails,
      };
    }
  }

  // 低分匹配 (>= 0.3) - 可能需要改进现有技能
  if (bestMatch && bestScore >= 0.3 && bestMatch.scope !== 'market') {
    // 生成更新建议
    const updateSuggestion = generateUpdateSuggestion(task, bestMatch);
    
    return {
      action: 'IMPROVE_EXISTING',
      skill: bestMatch.name,
      source: bestMatch.source,
      confidence: bestScore,
      reason: `找到部分匹配的技能 "${bestMatch.name}"（匹配度: ${(bestScore * 100).toFixed(0)}%），可能需要改进以满足需求`,
      matchDetails,
      updateSuggestion,
    };
  }

  // 有一些匹配但分数很低
  if (matchDetails.length > 0 && bestScore > 0) {
    return {
      action: 'CREATE_NEW',
      confidence: 0.5,
      reason: `找到一些相关技能但匹配度较低（最高: ${(bestScore * 100).toFixed(0)}%），建议创建新技能`,
      matchDetails,
    };
  }

  // 默认：创建新技能
  return {
    action: 'CREATE_NEW',
    confidence: 0.6,
    reason: '未找到匹配的技能，建议创建新技能',
    matchDetails: [],
  };
}
