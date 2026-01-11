/**
 * Markdown 解析工具函数
 * 处理 SKILL.md 文件的解析
 */

import type { SkillMetadata } from '../types/skill.js';

/**
 * YAML frontmatter 正则表达式
 */
const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n/;

/**
 * 解析 YAML frontmatter
 * 简单实现，不依赖外部库
 */
export function parseFrontmatter(content: string): { metadata: Record<string, any>; body: string } {
  const match = content.match(FRONTMATTER_REGEX);
  
  if (!match) {
    return { metadata: {}, body: content };
  }
  
  const yamlContent = match[1];
  const body = content.slice(match[0].length);
  
  const metadata: Record<string, any> = {};
  const lines = yamlContent.split('\n');
  
  let currentKey = '';
  let currentArray: string[] | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 跳过空行和注释
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // 检查是否是数组项
    if (trimmed.startsWith('- ')) {
      if (currentArray !== null) {
        currentArray.push(trimmed.slice(2).trim());
      }
      continue;
    }
    
    // 检查是否是键值对
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0) {
      // 保存之前的数组
      if (currentKey && currentArray !== null) {
        metadata[currentKey] = currentArray;
        currentArray = null;
      }
      
      currentKey = trimmed.slice(0, colonIndex).trim();
      const value = trimmed.slice(colonIndex + 1).trim();
      
      if (value === '') {
        // 可能是数组或嵌套对象的开始
        currentArray = [];
      } else {
        // 简单值
        metadata[currentKey] = parseValue(value);
        currentKey = '';
      }
    }
  }
  
  // 保存最后的数组
  if (currentKey && currentArray !== null) {
    metadata[currentKey] = currentArray;
  }
  
  return { metadata, body };
}

/**
 * 解析 YAML 值
 */
function parseValue(value: string): string | number | boolean {
  // 移除引号
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  // 布尔值
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // 数字
  const num = Number(value);
  if (!isNaN(num)) return num;
  
  return value;
}

/**
 * 从 SKILL.md 内容解析技能元数据
 */
export function parseSkillMetadata(content: string): SkillMetadata {
  const { metadata } = parseFrontmatter(content);
  
  return {
    name: metadata.name || '',
    description: metadata.description || '',
    version: metadata.version,
    author: metadata.author,
    tags: metadata.tags || [],
  };
}

/**
 * 获取 SKILL.md 的正文内容
 */
export function getSkillBody(content: string): string {
  const { body } = parseFrontmatter(content);
  return body.trim();
}

/**
 * 生成 SKILL.md 内容
 */
export function generateSkillMd(metadata: SkillMetadata, body: string): string {
  const lines: string[] = ['---'];
  
  lines.push(`name: ${metadata.name}`);
  lines.push(`description: ${metadata.description}`);
  
  if (metadata.version) {
    lines.push(`version: ${metadata.version}`);
  }
  
  if (metadata.author) {
    lines.push(`author: ${metadata.author}`);
  }
  
  if (metadata.tags && metadata.tags.length > 0) {
    lines.push('tags:');
    for (const tag of metadata.tags) {
      lines.push(`  - ${tag}`);
    }
  }
  
  lines.push('---');
  lines.push('');
  lines.push(body);
  
  return lines.join('\n');
}

/**
 * 从 Markdown 内容提取标题
 */
export function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * 从 Markdown 内容提取所有章节
 */
export function extractSections(content: string): Array<{ level: number; title: string; content: string }> {
  const sections: Array<{ level: number; title: string; content: string }> = [];
  const lines = content.split('\n');
  
  let currentSection: { level: number; title: string; content: string[] } | null = null;
  
  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headerMatch) {
      // 保存之前的章节
      if (currentSection) {
        sections.push({
          level: currentSection.level,
          title: currentSection.title,
          content: currentSection.content.join('\n').trim(),
        });
      }
      
      // 开始新章节
      currentSection = {
        level: headerMatch[1].length,
        title: headerMatch[2].trim(),
        content: [],
      };
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  }
  
  // 保存最后的章节
  if (currentSection) {
    sections.push({
      level: currentSection.level,
      title: currentSection.title,
      content: currentSection.content.join('\n').trim(),
    });
  }
  
  return sections;
}
