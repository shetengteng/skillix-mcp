/**
 * 反馈服务
 * 
 * 记录和分析技能使用反馈
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  SkillFeedback,
  SkillFeedbackFile,
  FeedbackAnalysis,
  FeedbackResult,
  SkillScope,
} from '../types.js';
import { getGlobalDir, getProjectDir } from '../../utils/paths.js';

// 反馈文件版本
const FEEDBACK_VERSION = '1.0.0';

// 反馈文件名
const FEEDBACK_FILE = 'feedbacks.json';

/**
 * 获取反馈文件路径
 */
function getFeedbackFilePath(scope: SkillScope, projectRoot?: string): string {
  const baseDir = scope === 'project' && projectRoot
    ? getProjectDir(projectRoot)
    : getGlobalDir();
  
  return path.join(baseDir, 'data', FEEDBACK_FILE);
}

/**
 * 读取反馈文件
 */
function readFeedbackFile(scope: SkillScope, projectRoot?: string): SkillFeedbackFile {
  const filePath = getFeedbackFilePath(scope, projectRoot);
  
  if (!fs.existsSync(filePath)) {
    return {
      version: FEEDBACK_VERSION,
      updatedAt: new Date().toISOString(),
      feedbacks: [],
    };
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as SkillFeedbackFile;
  } catch {
    return {
      version: FEEDBACK_VERSION,
      updatedAt: new Date().toISOString(),
      feedbacks: [],
    };
  }
}

/**
 * 写入反馈文件
 */
function writeFeedbackFile(
  data: SkillFeedbackFile,
  scope: SkillScope,
  projectRoot?: string
): void {
  const filePath = getFeedbackFilePath(scope, projectRoot);
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 生成反馈 ID
 */
function generateFeedbackId(): string {
  return `fb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * 记录反馈
 */
export function recordFeedback(
  skillName: string,
  result: FeedbackResult,
  options: {
    task?: string;
    notes?: string;
    scope?: SkillScope;
    projectRoot?: string;
  } = {}
): SkillFeedback {
  const { task, notes, scope = 'global', projectRoot } = options;
  
  const feedback: SkillFeedback = {
    id: generateFeedbackId(),
    skillName,
    result,
    task,
    notes,
    timestamp: new Date().toISOString(),
  };
  
  const data = readFeedbackFile(scope, projectRoot);
  data.feedbacks.push(feedback);
  writeFeedbackFile(data, scope, projectRoot);
  
  return feedback;
}

/**
 * 获取技能的反馈列表
 */
export function listFeedbacks(
  skillName?: string,
  options: {
    scope?: SkillScope;
    projectRoot?: string;
    days?: number;
  } = {}
): SkillFeedback[] {
  const { scope = 'global', projectRoot, days } = options;
  
  const data = readFeedbackFile(scope, projectRoot);
  let feedbacks = data.feedbacks;
  
  // 按技能名称过滤
  if (skillName) {
    feedbacks = feedbacks.filter(f => f.skillName === skillName);
  }
  
  // 按时间范围过滤
  if (days && days > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffTime = cutoff.getTime();
    
    feedbacks = feedbacks.filter(f => 
      new Date(f.timestamp).getTime() >= cutoffTime
    );
  }
  
  // 按时间倒序排列
  feedbacks.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return feedbacks;
}

/**
 * 分析技能反馈
 */
export function analyzeFeedback(
  skillName: string,
  options: {
    scope?: SkillScope;
    projectRoot?: string;
    days?: number;
  } = {}
): FeedbackAnalysis {
  const { scope = 'global', projectRoot, days = 30 } = options;
  
  const feedbacks = listFeedbacks(skillName, { scope, projectRoot, days });
  
  const totalCount = feedbacks.length;
  const successCount = feedbacks.filter(f => f.result === 'success').length;
  const failureCount = feedbacks.filter(f => f.result === 'failure').length;
  const partialCount = feedbacks.filter(f => f.result === 'partial').length;
  
  const successRate = totalCount > 0 ? successCount / totalCount : 0;
  
  // 判断是否建议更新
  let shouldUpdate = false;
  let updateReason: string | undefined;
  
  // 规则 1：近期失败次数 >= 3
  if (failureCount >= 3) {
    shouldUpdate = true;
    updateReason = `近期失败 ${failureCount} 次，建议检查技能是否需要更新`;
  }
  // 规则 2：成功率低于 50% 且有足够样本
  else if (totalCount >= 5 && successRate < 0.5) {
    shouldUpdate = true;
    updateReason = `成功率仅 ${(successRate * 100).toFixed(0)}%，建议改进技能`;
  }
  // 规则 3：部分成功次数较多
  else if (partialCount >= 3 && partialCount > successCount) {
    shouldUpdate = true;
    updateReason = `部分成功 ${partialCount} 次，技能可能需要扩展功能`;
  }
  
  return {
    skillName,
    totalCount,
    successCount,
    failureCount,
    partialCount,
    successRate,
    shouldUpdate,
    updateReason,
    recentFeedbacks: feedbacks.slice(0, 5),
  };
}

/**
 * 清除技能反馈
 */
export function clearFeedbacks(
  skillName?: string,
  options: {
    scope?: SkillScope;
    projectRoot?: string;
  } = {}
): number {
  const { scope = 'global', projectRoot } = options;
  
  const data = readFeedbackFile(scope, projectRoot);
  const originalCount = data.feedbacks.length;
  
  if (skillName) {
    // 只清除指定技能的反馈
    data.feedbacks = data.feedbacks.filter(f => f.skillName !== skillName);
  } else {
    // 清除所有反馈
    data.feedbacks = [];
  }
  
  writeFeedbackFile(data, scope, projectRoot);
  
  return originalCount - data.feedbacks.length;
}

/**
 * 导出反馈服务
 */
export const feedbackService = {
  recordFeedback,
  listFeedbacks,
  analyzeFeedback,
  clearFeedbacks,
};
