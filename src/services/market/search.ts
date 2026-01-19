/**
 * 搜索服务
 * 处理技能搜索功能
 */

import { loadManifest, loadSourceIndex, getAllSourceStatus } from './index-builder.js';
import { parseGitUrl, sourceIdToDirName } from './url.js';
import { getAllSources } from '../config/index.js';
import type { SearchResultItem, SkillIndexItem, ManifestSource } from '../types.js';

/**
 * 搜索选项
 */
export interface SearchOptions {
  /** 搜索关键词 */
  query: string;
  /** 指定源名称 */
  source?: string;
  /** 按标签筛选 */
  tags?: string[];
  /** 结果数量限制 */
  limit?: number;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  total: number;
  results: SearchResultItem[];
  sourceStatus: Array<{
    id: string;
    name: string;
    status: string;
    skillCount?: number;
    lastSync?: string;
    commit?: string;
    error?: string;
  }>;
}

/**
 * 搜索技能
 */
export function searchSkills(options: SearchOptions): SearchResult {
  const { query, source, tags, limit = 20 } = options;
  const manifest = loadManifest();
  const allResults: SearchResultItem[] = [];
  const sourceStatus: SearchResult['sourceStatus'] = [];

  // 获取要搜索的源
  let sourcesToSearch: ManifestSource[] = [];
  
  if (manifest) {
    if (source) {
      // 搜索指定源
      const targetSource = manifest.sources.find(s => s.name === source);
      if (targetSource) {
        sourcesToSearch = [targetSource];
      }
    } else {
      // 搜索所有源
      sourcesToSearch = manifest.sources;
    }
  }

  // 遍历每个源进行搜索
  for (const src of sourcesToSearch) {
    sourceStatus.push({
      id: src.id,
      name: src.name,
      status: src.status,
      skillCount: src.skillCount,
      lastSync: src.syncedAt,
      commit: src.commit,
      error: src.error,
    });

    if (src.status !== 'synced') {
      continue; // 跳过未同步的源
    }

    const dirName = sourceIdToDirName(src.id);
    const index = loadSourceIndex(dirName);
    
    if (!index) {
      continue;
    }

    // 在该源中搜索
    for (const skill of index.skills) {
      const score = calculateScore(skill, query, tags);
      
      if (score > 0) {
        allResults.push({
          name: skill.name,
          description: skill.description,
          version: skill.version,
          tags: skill.tags,
          sourceId: src.id,
          sourceName: src.name,
          author: skill.author,
          score,
        });
      }
    }
  }

  // 按分数排序
  allResults.sort((a, b) => (b.score || 0) - (a.score || 0));

  // 限制结果数量
  const results = allResults.slice(0, limit);

  return {
    total: allResults.length,
    results,
    sourceStatus,
  };
}

/**
 * 计算搜索匹配分数
 */
function calculateScore(skill: SkillIndexItem, query: string, tags?: string[]): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  // 名称匹配（权重 0.5）
  if (skill.name.toLowerCase().includes(queryLower)) {
    score += 0.5;
    // 完全匹配加分
    if (skill.name.toLowerCase() === queryLower) {
      score += 0.3;
    }
  }

  // 描述匹配（权重 0.3）
  if (skill.description.toLowerCase().includes(queryLower)) {
    score += 0.3;
  }

  // 标签匹配（权重 0.2）
  const skillTagsLower = skill.tags.map(t => t.toLowerCase());
  if (skillTagsLower.some(t => t.includes(queryLower))) {
    score += 0.2;
  }

  // 如果指定了标签筛选，检查是否匹配
  if (tags && tags.length > 0) {
    const tagsLower = tags.map(t => t.toLowerCase());
    const hasMatchingTag = tagsLower.some(t => skillTagsLower.includes(t));
    if (!hasMatchingTag) {
      return 0; // 不匹配标签筛选，返回 0 分
    }
    score += 0.1; // 标签筛选匹配加分
  }

  return score;
}

/**
 * 根据名称查找技能
 */
export function findSkillByName(
  skillName: string,
  sourceName?: string
): { skill: SkillIndexItem; sourceId: string; sourceName: string; dirName: string } | null {
  const manifest = loadManifest();
  if (!manifest) {
    return null;
  }

  // 确定搜索顺序：如果指定了源，只搜索该源；否则按默认源优先
  let sourcesToSearch: ManifestSource[] = [];
  
  if (sourceName) {
    const targetSource = manifest.sources.find(s => s.name === sourceName);
    if (targetSource && targetSource.status === 'synced') {
      sourcesToSearch = [targetSource];
    }
  } else {
    // 获取配置的源列表，按顺序搜索（默认源优先）
    const configSources = getAllSources();
    const defaultSource = configSources.find(s => s.default);
    
    // 先搜索默认源
    if (defaultSource) {
      const manifestSource = manifest.sources.find(
        s => s.name === defaultSource.name && s.status === 'synced'
      );
      if (manifestSource) {
        sourcesToSearch.push(manifestSource);
      }
    }
    
    // 再搜索其他源
    for (const src of manifest.sources) {
      if (src.status === 'synced' && !sourcesToSearch.some(s => s.id === src.id)) {
        sourcesToSearch.push(src);
      }
    }
  }

  // 在源中查找技能
  for (const src of sourcesToSearch) {
    const dirName = sourceIdToDirName(src.id);
    const index = loadSourceIndex(dirName);
    
    if (!index) {
      continue;
    }

    const skill = index.skills.find(s => s.name === skillName);
    if (skill) {
      return {
        skill,
        sourceId: src.id,
        sourceName: src.name,
        dirName,
      };
    }
  }

  return null;
}
