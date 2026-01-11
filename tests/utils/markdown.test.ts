/**
 * markdown 工具函数测试
 */

import { describe, it, expect } from 'vitest';
import * as markdown from '../../src/utils/markdown.js';
import { TEST_SKILL_MD, SIMPLE_SKILL_MD, INVALID_SKILL_MD } from '../fixtures/skills.js';

describe('markdown utils', () => {
  describe('parseFrontmatter', () => {
    it('should parse YAML frontmatter', () => {
      const { metadata, body } = markdown.parseFrontmatter(TEST_SKILL_MD);
      
      expect(metadata.name).toBe('test-skill');
      expect(metadata.description).toBe('A test skill for unit testing');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.author).toBe('test');
      expect(Array.isArray(metadata.tags)).toBe(true);
      expect(metadata.tags).toContain('test');
      expect(metadata.tags).toContain('unit');
      expect(body).toContain('# Test Skill');
    });

    it('should handle simple frontmatter', () => {
      const { metadata, body } = markdown.parseFrontmatter(SIMPLE_SKILL_MD);
      
      expect(metadata.name).toBe('simple-skill');
      expect(metadata.description).toBe('A simple test skill');
      expect(body).toContain('# Simple Skill');
    });

    it('should return empty metadata for no frontmatter', () => {
      const { metadata, body } = markdown.parseFrontmatter(INVALID_SKILL_MD);
      
      expect(metadata).toEqual({});
      expect(body).toContain('# No Frontmatter Skill');
    });

    it('should handle empty content', () => {
      const { metadata, body } = markdown.parseFrontmatter('');
      
      expect(metadata).toEqual({});
      expect(body).toBe('');
    });
  });

  describe('parseSkillMetadata', () => {
    it('should extract skill metadata from SKILL.md', () => {
      const metadata = markdown.parseSkillMetadata(TEST_SKILL_MD);
      
      expect(metadata.name).toBe('test-skill');
      expect(metadata.description).toBe('A test skill for unit testing');
      expect(metadata.version).toBe('1.0.0');
    });

    it('should provide default values for missing fields', () => {
      const metadata = markdown.parseSkillMetadata(INVALID_SKILL_MD);
      
      expect(metadata.name).toBe('');
      expect(metadata.description).toBe('');
    });
  });

  describe('generateSkillMd', () => {
    it('should generate valid SKILL.md content', () => {
      const metadata = {
        name: 'generated-skill',
        description: 'A generated skill',
        version: '1.0.0',
        author: 'test',
        tags: ['generated'],
      };
      const body = '# Generated Skill\n\nContent here.';
      
      const content = markdown.generateSkillMd(metadata, body);
      
      expect(content).toContain('name: generated-skill');
      expect(content).toContain('description: A generated skill');
      expect(content).toContain('version: 1.0.0');
      expect(content).toContain('author: test');
      expect(content).toContain('# Generated Skill');
    });

    it('should handle optional fields', () => {
      const metadata = {
        name: 'minimal-skill',
        description: 'Minimal skill',
      };
      const body = '# Minimal';
      
      const content = markdown.generateSkillMd(metadata, body);
      
      expect(content).toContain('name: minimal-skill');
      expect(content).toContain('description: Minimal skill');
      expect(content).toContain('# Minimal');
    });

    it('should be parseable by parseFrontmatter', () => {
      const originalMetadata = {
        name: 'roundtrip-skill',
        description: 'Test roundtrip',
        version: '2.0.0',
      };
      const originalBody = '# Roundtrip Test';
      
      const content = markdown.generateSkillMd(originalMetadata, originalBody);
      const { metadata, body } = markdown.parseFrontmatter(content);
      
      expect(metadata.name).toBe(originalMetadata.name);
      expect(metadata.description).toBe(originalMetadata.description);
      expect(metadata.version).toBe(originalMetadata.version);
      expect(body.trim()).toContain(originalBody);
    });
  });

  describe('getSkillBody', () => {
    it('should extract body from SKILL.md', () => {
      const body = markdown.getSkillBody(TEST_SKILL_MD);
      
      expect(body).toContain('# Test Skill');
      expect(body).not.toContain('---');
    });
  });

  describe('extractTitle', () => {
    it('should extract title from markdown', () => {
      const title = markdown.extractTitle('# My Title\n\nContent');
      expect(title).toBe('My Title');
    });

    it('should return null for no title', () => {
      const title = markdown.extractTitle('No title here');
      expect(title).toBeNull();
    });
  });

  describe('extractSections', () => {
    it('should extract sections from markdown', () => {
      const content = `# Title

## Section 1

Content 1

## Section 2

Content 2
`;
      const sections = markdown.extractSections(content);
      
      expect(sections.length).toBe(3);
      expect(sections[0].title).toBe('Title');
      expect(sections[1].title).toBe('Section 1');
      expect(sections[2].title).toBe('Section 2');
    });
  });
});
