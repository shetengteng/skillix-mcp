/**
 * Markdown 解析工具函数测试
 */

import { describe, it, expect } from 'vitest';
import {
  parseFrontmatter,
  parseSkillMetadata,
  getSkillBody,
  generateSkillMd,
  extractTitle,
  extractSections,
} from '../../src/utils/markdown.js';
import { SKILL_MD_CONTENT, NO_FRONTMATTER_CONTENT } from '../fixtures/skills.js';

describe('markdown utils', () => {
  describe('parseFrontmatter', () => {
    it('should parse YAML frontmatter correctly', () => {
      const { metadata, body } = parseFrontmatter(SKILL_MD_CONTENT);
      
      expect(metadata.name).toBe('test-skill');
      expect(metadata.description).toBe('用于单元测试的测试技能');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.author).toBe('test-author');
      expect(metadata.tags).toEqual(['test', 'unit']);
    });

    it('should return empty metadata for content without frontmatter', () => {
      const { metadata, body } = parseFrontmatter(NO_FRONTMATTER_CONTENT);
      
      expect(metadata).toEqual({});
      expect(body).toBe(NO_FRONTMATTER_CONTENT);
    });

    it('should handle boolean values', () => {
      const content = `---
enabled: true
disabled: false
---

Content`;
      
      const { metadata } = parseFrontmatter(content);
      expect(metadata.enabled).toBe(true);
      expect(metadata.disabled).toBe(false);
    });

    it('should handle numeric values', () => {
      const content = `---
count: 42
version: 1.0
---

Content`;
      
      const { metadata } = parseFrontmatter(content);
      expect(metadata.count).toBe(42);
      expect(metadata.version).toBe(1.0);
    });

    it('should handle quoted strings', () => {
      const content = `---
single: 'single quoted'
double: "double quoted"
---

Content`;
      
      const { metadata } = parseFrontmatter(content);
      expect(metadata.single).toBe('single quoted');
      expect(metadata.double).toBe('double quoted');
    });

    it('should extract body content after frontmatter', () => {
      const { body } = parseFrontmatter(SKILL_MD_CONTENT);
      
      expect(body).toContain('# 测试技能');
      expect(body).toContain('这是一个用于单元测试的测试技能');
    });

    it('should handle empty array', () => {
      const content = `---
name: test
tags:
---

Content`;
      
      const { metadata } = parseFrontmatter(content);
      expect(metadata.tags).toEqual([]);
    });
  });

  describe('parseSkillMetadata', () => {
    it('should parse skill metadata from content', () => {
      const metadata = parseSkillMetadata(SKILL_MD_CONTENT);
      
      expect(metadata.name).toBe('test-skill');
      expect(metadata.description).toBe('用于单元测试的测试技能');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.author).toBe('test-author');
      expect(metadata.tags).toEqual(['test', 'unit']);
    });

    it('should return empty strings for missing fields', () => {
      const content = `---
version: 1.0.0
---

Content`;
      
      const metadata = parseSkillMetadata(content);
      expect(metadata.name).toBe('');
      expect(metadata.description).toBe('');
    });

    it('should return empty array for missing tags', () => {
      const content = `---
name: test
description: A test skill
---

Content`;
      
      const metadata = parseSkillMetadata(content);
      expect(metadata.tags).toEqual([]);
    });
  });

  describe('getSkillBody', () => {
    it('should return body content without frontmatter', () => {
      const body = getSkillBody(SKILL_MD_CONTENT);
      
      expect(body).not.toContain('---');
      expect(body).toContain('# 测试技能');
    });

    it('should return trimmed content', () => {
      const body = getSkillBody(SKILL_MD_CONTENT);
      
      expect(body).toBe(body.trim());
    });

    it('should return full content when no frontmatter', () => {
      const body = getSkillBody(NO_FRONTMATTER_CONTENT);
      
      expect(body).toBe(NO_FRONTMATTER_CONTENT.trim());
    });
  });

  describe('generateSkillMd', () => {
    it('should generate valid SKILL.md content', () => {
      const metadata = {
        name: 'my-skill',
        description: 'My test skill',
        version: '1.0.0',
        author: 'test',
        tags: ['tag1', 'tag2'],
      };
      const body = '# My Skill\n\nContent here.';
      
      const content = generateSkillMd(metadata, body);
      
      expect(content).toContain('---');
      expect(content).toContain('name: my-skill');
      expect(content).toContain('description: My test skill');
      expect(content).toContain('version: 1.0.0');
      expect(content).toContain('author: test');
      expect(content).toContain('tags:');
      expect(content).toContain('  - tag1');
      expect(content).toContain('  - tag2');
      expect(content).toContain('# My Skill');
    });

    it('should omit optional fields when not provided', () => {
      const metadata = {
        name: 'simple-skill',
        description: 'A simple skill',
      };
      const body = '# Simple\n\nBody content.';
      
      const content = generateSkillMd(metadata, body);
      
      expect(content).toContain('name: simple-skill');
      expect(content).toContain('description: A simple skill');
      expect(content).not.toContain('version:');
      expect(content).not.toContain('author:');
      expect(content).not.toContain('tags:');
    });

    it('should generate content that can be parsed back', () => {
      const metadata = {
        name: 'roundtrip-skill',
        description: 'Test roundtrip parsing',
        version: '2.0.0',
        author: 'tester',
        tags: ['roundtrip'],
      };
      const body = '# Roundtrip\n\nTest content.';
      
      const content = generateSkillMd(metadata, body);
      const parsed = parseSkillMetadata(content);
      
      expect(parsed.name).toBe(metadata.name);
      expect(parsed.description).toBe(metadata.description);
      expect(parsed.version).toBe(metadata.version);
      expect(parsed.author).toBe(metadata.author);
      expect(parsed.tags).toEqual(metadata.tags);
    });
  });

  describe('extractTitle', () => {
    it('should extract h1 title', () => {
      const content = '# Main Title\n\nSome content.';
      expect(extractTitle(content)).toBe('Main Title');
    });

    it('should return first h1 if multiple exist', () => {
      const content = '# First\n\n# Second';
      expect(extractTitle(content)).toBe('First');
    });

    it('should return null when no h1 exists', () => {
      const content = '## Not H1\n\nSome content.';
      expect(extractTitle(content)).toBeNull();
    });

    it('should handle title with extra spaces', () => {
      const content = '#   Spaced Title   \n\nContent.';
      expect(extractTitle(content)).toBe('Spaced Title');
    });
  });

  describe('extractSections', () => {
    it('should extract all sections', () => {
      const content = `# Title

Intro content.

## Section 1

Section 1 content.

## Section 2

Section 2 content.

### Subsection

Subsection content.`;
      
      const sections = extractSections(content);
      
      expect(sections.length).toBe(4);
      expect(sections[0].level).toBe(1);
      expect(sections[0].title).toBe('Title');
      expect(sections[1].level).toBe(2);
      expect(sections[1].title).toBe('Section 1');
      expect(sections[2].level).toBe(2);
      expect(sections[2].title).toBe('Section 2');
      expect(sections[3].level).toBe(3);
      expect(sections[3].title).toBe('Subsection');
    });

    it('should capture section content', () => {
      const content = `# Title

Title content here.

## Section

Section content here.`;
      
      const sections = extractSections(content);
      
      expect(sections[0].content).toContain('Title content here.');
      expect(sections[1].content).toContain('Section content here.');
    });

    it('should return empty array for content without headers', () => {
      const content = 'Just plain text without any headers.';
      const sections = extractSections(content);
      expect(sections).toEqual([]);
    });

    it('should handle deeply nested sections', () => {
      const content = `# H1
###### H6`;
      
      const sections = extractSections(content);
      
      expect(sections.length).toBe(2);
      expect(sections[0].level).toBe(1);
      expect(sections[1].level).toBe(6);
    });
  });
});
