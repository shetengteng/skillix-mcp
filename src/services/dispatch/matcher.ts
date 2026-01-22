/**
 * 技能匹配算法
 * 
 * 多维度匹配算法实现：
 * - 名称匹配
 * - 描述关键词匹配
 * - 标签匹配
 * - 领域同义词匹配
 */

import { DOMAIN_SYNONYMS } from './synonyms.js';
import type { SkillInfo, MatchScoreDetails } from '../types.js';

// ============================================
// 关键词提取和匹配工具函数
// ============================================

/**
 * 提取文本中的关键词
 */
export function extractKeywords(text: string): string[] {
  const normalized = text.toLowerCase();
  // 分割中英文，过滤短词
  const words = normalized.split(/[\s\-_,.，。、；：！？]+/).filter(w => w.length >= 2);
  // 去重
  return [...new Set(words)];
}

/**
 * 计算两个关键词数组的重叠度
 */
export function calculateOverlap(keywords1: string[], keywords2: string[]): number {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  
  let matchCount = 0;
  for (const word of set1) {
    if (set2.has(word)) {
      matchCount++;
    } else {
      // 部分匹配（一个词包含另一个词）
      for (const word2 of set2) {
        if (word.includes(word2) || word2.includes(word)) {
          matchCount += 0.5;
          break;
        }
      }
    }
  }
  
  return matchCount / Math.max(set1.size, set2.size);
}

/**
 * 识别任务中涉及的领域
 */
export function identifyDomains(keywords: string[]): string[] {
  const domains: string[] = [];
  
  for (const [domain, synonyms] of Object.entries(DOMAIN_SYNONYMS)) {
    for (const keyword of keywords) {
      if (synonyms.some(syn => 
        syn.toLowerCase().includes(keyword) || 
        keyword.includes(syn.toLowerCase())
      )) {
        if (!domains.includes(domain)) {
          domains.push(domain);
        }
        break;
      }
    }
  }
  
  return domains;
}

/**
 * 计算技能与领域的匹配度
 */
export function matchDomainSynonyms(task: string, skill: SkillInfo): { score: number; matchedDomains: string[] } {
  const taskLower = task.toLowerCase();
  const skillText = `${skill.name} ${skill.description} ${(skill.tags || []).join(' ')}`.toLowerCase();
  
  const matchedDomains: string[] = [];
  let score = 0;
  
  for (const [domain, synonyms] of Object.entries(DOMAIN_SYNONYMS)) {
    // 检查任务是否涉及此领域
    const taskHasDomain = synonyms.some(syn => taskLower.includes(syn.toLowerCase()));
    // 检查技能是否涉及此领域
    const skillHasDomain = synonyms.some(syn => skillText.includes(syn.toLowerCase()));
    
    if (taskHasDomain && skillHasDomain) {
      matchedDomains.push(domain);
      score += 0.3;
    }
  }
  
  return { score: Math.min(1, score), matchedDomains };
}

/**
 * 多维度匹配算法
 * 
 * 权重分配：
 * - 名称匹配：0.3
 * - 描述关键词匹配：0.35
 * - 标签匹配：0.15
 * - 领域同义词匹配：0.2
 */
export function calculateMatchScore(task: string, skill: SkillInfo): MatchScoreDetails {
  const taskLower = task.toLowerCase();
  const nameLower = skill.name.toLowerCase();
  const descLower = skill.description.toLowerCase();
  
  const matchedKeywords: string[] = [];
  
  // 1. 名称匹配 (权重 0.3)
  let nameScore = 0;
  
  // 将名称转换为空格分隔形式进行比较
  const nameWithSpaces = nameLower.replace(/-/g, ' ');
  const taskNormalized = taskLower.replace(/-/g, ' ');
  
  // 完全匹配（考虑连字符和空格的等价性）
  if (taskNormalized.includes(nameWithSpaces) || taskLower.includes(nameLower)) {
    nameScore = 1;
    matchedKeywords.push(skill.name);
  } else {
    // 名称部分匹配（按连字符或空格分割）
    const nameParts = nameLower.split(/[-\s]+/).filter(p => p.length >= 2);
    const taskParts = taskLower.split(/[-\s]+/).filter(p => p.length >= 2);
    
    let partMatches = 0;
    for (const part of nameParts) {
      // 检查任务中是否包含此部分
      if (taskParts.includes(part) || taskLower.includes(part)) {
        partMatches++;
        if (!matchedKeywords.includes(part)) {
          matchedKeywords.push(part);
        }
      }
    }
    if (nameParts.length > 0) {
      nameScore = partMatches / nameParts.length;
    }
  }
  
  // 2. 描述关键词匹配 (权重 0.35)
  const descKeywords = extractKeywords(skill.description);
  const taskKeywords = extractKeywords(task);
  const descriptionScore = calculateOverlap(descKeywords, taskKeywords);
  
  // 记录匹配的描述关键词
  for (const keyword of taskKeywords) {
    if (descLower.includes(keyword) && !matchedKeywords.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }
  
  // 3. 标签匹配 (权重 0.15)
  let tagScore = 0;
  if (skill.tags && skill.tags.length > 0) {
    for (const tag of skill.tags) {
      const tagLower = tag.toLowerCase();
      if (taskLower.includes(tagLower)) {
        tagScore += 1 / skill.tags.length;
        if (!matchedKeywords.includes(tag)) {
          matchedKeywords.push(tag);
        }
      }
    }
  }
  
  // 4. 领域同义词匹配 (权重 0.2)
  const domainMatch = matchDomainSynonyms(task, skill);
  const domainScore = domainMatch.score;
  
  // 计算总分（调整权重：名称 0.3, 描述 0.35, 标签 0.15, 领域 0.2）
  const total = Math.min(1, 
    nameScore * 0.3 + 
    descriptionScore * 0.35 + 
    tagScore * 0.15 + 
    domainScore * 0.2
  );
  
  return {
    total,
    nameScore,
    descriptionScore,
    tagScore,
    domainScore,
    matchedKeywords,
    matchedDomains: domainMatch.matchedDomains,
  };
}
