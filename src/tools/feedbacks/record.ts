/**
 * sx-feedback record 子命令
 * 记录技能使用反馈
 */

import type { ToolResponse, SxFeedbackParams } from '../types.js';
import { feedbackService } from '../../services/index.js';
import { success, error } from '../../utils/response.js';

/**
 * 处理记录反馈
 */
export function handleRecord(params: SxFeedbackParams): ToolResponse {
  const { skillName, result, task, notes, scope = 'global', projectRoot } = params;
  
  if (!skillName) {
    return error({
      message: '缺少技能名称',
      errors: ['参数 skillName 是必需的'],
    });
  }
  
  if (!result) {
    return error({
      message: '缺少执行结果',
      errors: ['参数 result 是必需的，可选值: success, failure, partial'],
    });
  }
  
  if (!['success', 'failure', 'partial'].includes(result)) {
    return error({
      message: '无效的执行结果',
      errors: ['result 必须是 success, failure 或 partial'],
    });
  }
  
  try {
    const feedback = feedbackService.recordFeedback(skillName, result, {
      task,
      notes,
      scope,
      projectRoot,
    });
    
    return success({
      message: `成功记录技能 "${skillName}" 的反馈`,
      data: {
        feedback,
        tips: result === 'failure' 
          ? '如果技能经常失败，建议使用 sx-feedback action=analyze 分析是否需要更新'
          : undefined,
      },
    });
  } catch (e) {
    return error({
      message: '记录反馈失败',
      errors: [e instanceof Error ? e.message : String(e)],
    });
  }
}
