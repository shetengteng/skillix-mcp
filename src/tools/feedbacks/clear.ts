/**
 * sx-feedback clear 子命令
 * 清除技能反馈记录
 */

import type { ToolResponse, SxFeedbackParams } from '../types.js';
import { feedbackService } from '../../services/index.js';
import { success, error } from '../../utils/response.js';

/**
 * 处理清除反馈
 */
export function handleClear(params: SxFeedbackParams): ToolResponse {
  const { skillName, scope = 'global', projectRoot } = params;
  
  try {
    const clearedCount = feedbackService.clearFeedbacks(skillName, {
      scope,
      projectRoot,
    });
    
    const message = skillName
      ? `已清除技能 "${skillName}" 的 ${clearedCount} 条反馈记录`
      : `已清除 ${clearedCount} 条反馈记录`;
    
    return success({
      message,
      data: {
        clearedCount,
        skillName: skillName || 'all',
        scope,
      },
    });
  } catch (e) {
    return error({
      message: '清除反馈失败',
      errors: [e instanceof Error ? e.message : String(e)],
    });
  }
}
