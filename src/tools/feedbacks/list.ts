/**
 * sx-feedback list 子命令
 * 列出技能反馈记录
 */

import type { ToolResponse, SxFeedbackParams } from '../types.js';
import { feedbackService } from '../../services/index.js';
import { success, error } from '../../utils/response.js';

/**
 * 处理列出反馈
 */
export function handleList(params: SxFeedbackParams): ToolResponse {
  const { skillName, scope = 'global', projectRoot, days } = params;
  
  try {
    const feedbacks = feedbackService.listFeedbacks(skillName, {
      scope,
      projectRoot,
      days,
    });
    
    const message = skillName
      ? `技能 "${skillName}" 共有 ${feedbacks.length} 条反馈记录`
      : `共有 ${feedbacks.length} 条反馈记录`;
    
    // 统计各类型数量
    const stats = {
      total: feedbacks.length,
      success: feedbacks.filter(f => f.result === 'success').length,
      failure: feedbacks.filter(f => f.result === 'failure').length,
      partial: feedbacks.filter(f => f.result === 'partial').length,
    };
    
    return success({
      message,
      data: {
        stats,
        feedbacks: feedbacks.slice(0, 20), // 最多返回 20 条
        hasMore: feedbacks.length > 20,
      },
    });
  } catch (e) {
    return error({
      message: '获取反馈列表失败',
      errors: [e instanceof Error ? e.message : String(e)],
    });
  }
}
