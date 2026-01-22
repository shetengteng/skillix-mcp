/**
 * sx-feedback analyze 子命令
 * 分析技能反馈，判断是否需要更新
 */

import type { ToolResponse, SxFeedbackParams } from '../types.js';
import { feedbackService } from '../../services/index.js';
import { success, error } from '../../utils/response.js';

/**
 * 处理分析反馈
 */
export function handleAnalyze(params: SxFeedbackParams): ToolResponse {
  const { skillName, scope = 'global', projectRoot, days = 30 } = params;
  
  if (!skillName) {
    return error({
      message: '缺少技能名称',
      errors: ['参数 skillName 是必需的'],
    });
  }
  
  try {
    const analysis = feedbackService.analyzeFeedback(skillName, {
      scope,
      projectRoot,
      days,
    });
    
    // 构建消息
    let message: string;
    if (analysis.totalCount === 0) {
      message = `技能 "${skillName}" 暂无反馈记录`;
    } else if (analysis.shouldUpdate) {
      message = `技能 "${skillName}" 建议更新: ${analysis.updateReason}`;
    } else {
      message = `技能 "${skillName}" 运行良好（成功率: ${(analysis.successRate * 100).toFixed(0)}%）`;
    }
    
    return success({
      message,
      data: {
        analysis: {
          skillName: analysis.skillName,
          totalCount: analysis.totalCount,
          successCount: analysis.successCount,
          failureCount: analysis.failureCount,
          partialCount: analysis.partialCount,
          successRate: `${(analysis.successRate * 100).toFixed(1)}%`,
          shouldUpdate: analysis.shouldUpdate,
          updateReason: analysis.updateReason,
        },
        recentFeedbacks: analysis.recentFeedbacks,
        // 提供下一步建议
        nextSteps: analysis.shouldUpdate
          ? [
              `使用 sx-skill action=read name="${skillName}" 查看技能内容`,
              `分析失败原因后使用 sx-skill action=update 更新技能`,
            ]
          : undefined,
      },
    });
  } catch (e) {
    return error({
      message: '分析反馈失败',
      errors: [e instanceof Error ? e.message : String(e)],
    });
  }
}
