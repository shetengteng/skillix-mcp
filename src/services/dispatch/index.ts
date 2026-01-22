/**
 * Dispatch 服务
 * 智能分流服务入口
 * 
 * AI First 设计：
 * - 收集本地和市场技能信息
 * - 使用多维度匹配算法提供初步建议
 * - 最终决策由 AI 根据返回信息自行判断
 */

// 导出分析函数
export { analyze, DOMAIN_SYNONYMS } from './analyzer.js';

// 导出类型
export type { AnalyzeParams, SkillInfo, MatchScoreDetails, ScoredSkill } from '../types.js';

// 导出匹配工具函数（供测试使用）
export { 
  calculateMatchScore, 
  extractKeywords, 
  calculateOverlap,
  identifyDomains,
  matchDomainSynonyms,
} from './matcher.js';

// 导出收集器函数（供测试使用）
export { collectLocalSkills, collectMarketSkills } from './collector.js';

// 导出服务对象
import { analyze } from './analyzer.js';

export const dispatchService = {
  analyze,
};
