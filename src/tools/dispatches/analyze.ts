/**
 * sx-dispatch analyze 操作
 * 分析任务并推荐最佳操作
 * 
 * AI First 设计：
 * - 收集本地和市场技能信息
 * - 提供初步匹配建议
 * - 最终决策由 AI 根据返回信息自行判断
 */

import type { ToolResponse, SxDispatchParams } from '../types.js';
import { analyze } from '../../services/dispatch/index.js';
import { success, error } from '../../utils/response.js';

/**
 * 处理分析操作
 */
export function handleAnalyze(params: SxDispatchParams): ToolResponse {
  const { task, context, hints, projectRoot } = params;

  // 验证必需参数
  if (!task || task.trim().length === 0) {
    return error({
      message: '缺少任务描述',
      errors: ['参数 task 是必需的'],
    });
  }

  try {
    // 执行分流分析
    const result = analyze({
      task: task.trim(),
      context,
      hints,
      projectRoot,
    });

    // 构建响应消息
    let message: string;
    switch (result.action) {
      case 'USE_EXISTING':
        message = `建议使用本地技能 "${result.skill}"`;
        break;
      case 'IMPROVE_EXISTING':
        message = `建议改进本地技能 "${result.skill}"`;
        break;
      case 'CREATE_NEW':
        message = '建议创建新技能';
        break;
      case 'INSTALL':
        message = `建议从市场安装技能 "${result.skill}"`;
        break;
      case 'COMPOSE':
        message = '建议组合多个技能';
        break;
      case 'NO_SKILL_NEEDED':
        message = '此任务可能无需使用技能';
        break;
      default:
        message = '分析完成，请根据以下信息决策';
    }

    return success({
      message,
      data: {
        // 任务信息
        task: task.trim(),
        context: context || null,
        hints: hints || [],
        
        // 初步推荐（仅供参考，AI 可自行判断）
        recommendation: {
          action: result.action,
          skill: result.skill || null,
          source: result.source || null,
          confidence: result.confidence,
          reason: result.reason,
        },
        
        // 可用技能列表（供 AI 分析选择，包含详细匹配信息）
        availableSkills: result.matchDetails?.map(m => ({
          name: m.name,
          description: m.description,
          scope: m.scope,
          source: m.source,
          // 匹配分数
          relevanceScore: m.score,
          // 详细分数（帮助 AI 理解匹配原因）
          scoreDetails: {
            nameScore: m.nameScore,
            descriptionScore: m.descriptionScore,
            tagScore: m.tagScore,
            domainScore: m.domainScore,
          },
          // 匹配的关键词和领域
          matchedKeywords: m.matchedKeywords || [],
          matchedDomains: m.matchedDomains || [],
        })) || [],
        
        // 下一步操作建议
        nextSteps: buildNextSteps(result.action, result.skill, result.source),
        
        // AI 决策提示
        aiHint: buildAiHint(result),
      },
    });
  } catch (e) {
    return error({
      message: '分流分析失败',
      errors: [e instanceof Error ? e.message : String(e)],
    });
  }
}

/**
 * 构建 AI 决策提示
 */
function buildAiHint(result: { action: string; matchDetails?: Array<{ name: string; description: string }> }): string {
  const hasSkills = result.matchDetails && result.matchDetails.length > 0;
  
  if (!hasSkills) {
    return '未找到相关技能，建议创建新技能或直接执行任务';
  }
  
  return `请根据任务描述和可用技能列表，判断：
1. 是否有技能完全匹配任务需求？如果是，使用 USE_EXISTING
2. 是否有技能部分匹配但需要改进？如果是，使用 IMPROVE_EXISTING  
3. 是否需要从市场安装技能？如果是，使用 INSTALL
4. 是否需要创建新技能？如果是，使用 CREATE_NEW
5. 任务是否简单到不需要技能？如果是，直接执行`;
}

/**
 * 构建下一步操作建议
 */
function buildNextSteps(
  action: string,
  skill?: string,
  source?: string
): string[] {
  switch (action) {
    case 'USE_EXISTING':
      return [
        `使用 sx-skill action=read name="${skill}" 查看技能内容`,
        '按照技能指引执行任务',
      ];
      
    case 'IMPROVE_EXISTING':
      return [
        `使用 sx-skill action=read name="${skill}" 查看技能内容`,
        `使用 sx-skill action=update name="${skill}" 更新技能`,
        '按照更新后的技能指引执行任务',
      ];
      
    case 'CREATE_NEW':
      return [
        '使用 sx-help topic=skill 查看技能创建指南',
        '使用 sx-skill action=create 创建新技能',
      ];
      
    case 'INSTALL':
      return [
        `使用 sx-market action=install name="${skill}" 安装技能`,
        `安装后使用 sx-skill action=read name="${skill}" 查看技能内容`,
      ];
      
    case 'COMPOSE':
      return [
        '使用 sx-skill action=list 查看可用技能',
        '选择需要组合的技能并按顺序执行',
      ];
      
    case 'NO_SKILL_NEEDED':
      return [
        '直接执行任务即可',
      ];
      
    default:
      return [];
  }
}
