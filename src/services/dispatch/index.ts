/**
 * Dispatch 服务
 * 智能分流服务入口
 * 
 * AI First 设计：
 * - 收集本地和市场技能信息
 * - 提供初步匹配建议
 * - 最终决策由 AI 根据返回信息自行判断
 */

export { analyze } from './analyzer.js';
export type { AnalyzeParams } from './analyzer.js';

// 导出服务对象
import { analyze } from './analyzer.js';

export const dispatchService = {
  analyze,
};
