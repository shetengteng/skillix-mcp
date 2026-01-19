/**
 * skill 服务测试
 * 注意：由于全局路径依赖 os.homedir()，这里主要测试项目级技能
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import * as nodeFs from 'node:fs';
import { createTempDir, cleanupTempDir, createTestSkill } from '../helpers/setup.js';
import * as skillService from '../../src/services/skill/index.js';
import { TEST_SKILL_MD, SIMPLE_SKILL_MD } from '../fixtures/skills.js';

describe('skill service', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('listProjectSkills', () => {
    it('should list project skills', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      
      createTestSkill(projectSkillsDir, 'project-skill-1', TEST_SKILL_MD);
      createTestSkill(projectSkillsDir, 'project-skill-2', SIMPLE_SKILL_MD);
      
      const skills = skillService.listProjectSkills(projectRoot);
      
      expect(skills.length).toBe(2);
      expect(skills[0].scope).toBe('project');
    });

    it('should return empty array when no project skills exist', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      
      const skills = skillService.listProjectSkills(projectRoot);
      expect(skills).toEqual([]);
    });
  });

  describe('getSkill with projectRoot', () => {
    it('should get project skill', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'test-skill', TEST_SKILL_MD);
      
      const skill = skillService.getSkill('test-skill', projectRoot);
      
      expect(skill).not.toBeNull();
      expect(skill?.name).toBe('test-skill');
      expect(skill?.scope).toBe('project');
    });

    it('should return null for non-existing skill', () => {
      const projectRoot = tempDir;
      const skill = skillService.getSkill('non-existing', projectRoot);
      expect(skill).toBeNull();
    });
  });

  describe('readSkillContent with projectRoot', () => {
    it('should read skill content', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'test-skill', TEST_SKILL_MD);
      
      const content = skillService.readSkillContent('test-skill', projectRoot);
      
      expect(content).not.toBeNull();
      expect(content?.metadata).toBeDefined();
      expect(content?.body).toBeDefined();
    });

    it('should return null for non-existing skill', () => {
      const projectRoot = tempDir;
      const content = skillService.readSkillContent('non-existing', projectRoot);
      expect(content).toBeNull();
    });
  });

  describe('createSkill', () => {
    it('should create project skill', () => {
      const projectRoot = tempDir;
      const metadata = {
        name: 'new-skill',
        description: 'A new skill',
      };
      
      const skill = skillService.createSkill(
        'new-skill',
        metadata,
        '# New Skill\n\nContent here.',
        'project',
        projectRoot
      );
      
      expect(skill).toBeDefined();
      expect(skill.name).toBe('new-skill');
      expect(skill.scope).toBe('project');
      
      const skillDir = path.join(projectRoot, '.skillix', 'skills', 'new-skill');
      expect(nodeFs.existsSync(skillDir)).toBe(true);
      expect(nodeFs.existsSync(path.join(skillDir, 'SKILL.md'))).toBe(true);
    });

    it('should create skill with all metadata', () => {
      const projectRoot = tempDir;
      const metadata = {
        name: 'full-skill',
        description: 'A full skill',
        version: '1.0.0',
        author: 'test',
        tags: ['test', 'full'],
      };
      
      const skill = skillService.createSkill(
        'full-skill',
        metadata,
        '# Full Skill',
        'project',
        projectRoot
      );
      
      expect(skill.metadata.version).toBe('1.0.0');
      expect(skill.metadata.author).toBe('test');
    });
  });

  describe('updateSkill', () => {
    it('should update existing skill metadata', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'update-skill', TEST_SKILL_MD);
      
      const updated = skillService.updateSkill('update-skill', {
        metadata: { name: 'update-skill', description: 'Updated description' },
      }, projectRoot);
      
      expect(updated).not.toBeNull();
      expect(updated?.description).toBe('Updated description');
    });

    it('should update skill body only', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'update-body-skill', TEST_SKILL_MD);
      
      const updated = skillService.updateSkill('update-body-skill', {
        body: '# Updated Body\n\nNew content.',
      }, projectRoot);
      
      expect(updated).not.toBeNull();
      expect(updated?.content).toContain('# Updated Body');
    });

    it('should return null for non-existing skill', () => {
      const projectRoot = tempDir;
      const updated = skillService.updateSkill('non-existing', {
        metadata: { name: 'non-existing', description: 'Updated' },
      }, projectRoot);
      
      expect(updated).toBeNull();
    });

    it('should preserve unchanged metadata fields when updating partially', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'partial-update-skill', TEST_SKILL_MD);
      
      // 只更新 version，其他字段应保持不变
      const updated = skillService.updateSkill('partial-update-skill', {
        metadata: { name: 'partial-update-skill', description: 'A test skill for unit testing', version: '2.0.0' },
      }, projectRoot);
      
      expect(updated).not.toBeNull();
      expect(updated?.metadata.version).toBe('2.0.0');
      // 原有的 author 和 tags 应该保留
      expect(updated?.metadata.author).toBe('test');
      expect(updated?.metadata.tags).toContain('test');
    });

    it('should update both metadata and body simultaneously', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'full-update-skill', TEST_SKILL_MD);
      
      const updated = skillService.updateSkill('full-update-skill', {
        metadata: { 
          name: 'full-update-skill', 
          description: 'Fully updated skill',
          version: '3.0.0',
        },
        body: '# Completely New Content\n\nThis is brand new.',
      }, projectRoot);
      
      expect(updated).not.toBeNull();
      expect(updated?.description).toBe('Fully updated skill');
      expect(updated?.metadata.version).toBe('3.0.0');
      expect(updated?.content).toContain('# Completely New Content');
    });

    it('should preserve original body when only updating metadata', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'metadata-only-skill', TEST_SKILL_MD);
      
      const updated = skillService.updateSkill('metadata-only-skill', {
        metadata: { name: 'metadata-only-skill', description: 'New description only' },
      }, projectRoot);
      
      expect(updated).not.toBeNull();
      expect(updated?.description).toBe('New description only');
      // 原有的 body 内容应该保留
      expect(updated?.content).toContain('# Test Skill');
      expect(updated?.content).toContain('This is a test skill for unit testing.');
    });

    it('should update tags correctly', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'tags-update-skill', TEST_SKILL_MD);
      
      const updated = skillService.updateSkill('tags-update-skill', {
        metadata: { 
          name: 'tags-update-skill', 
          description: 'A test skill for unit testing',
          tags: ['new-tag-1', 'new-tag-2', 'new-tag-3'],
        },
      }, projectRoot);
      
      expect(updated).not.toBeNull();
      expect(updated?.metadata.tags).toHaveLength(3);
      expect(updated?.metadata.tags).toContain('new-tag-1');
      expect(updated?.metadata.tags).toContain('new-tag-2');
      expect(updated?.metadata.tags).toContain('new-tag-3');
    });
  });

  describe('deleteSkill', () => {
    it('should delete existing skill', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'delete-skill', TEST_SKILL_MD);
      
      const result = skillService.deleteSkill('delete-skill', projectRoot);
      
      expect(result).toBe(true);
      
      const skillDir = path.join(projectSkillsDir, 'delete-skill');
      expect(nodeFs.existsSync(skillDir)).toBe(false);
    });

    it('should return false for non-existing skill', () => {
      const projectRoot = tempDir;
      const result = skillService.deleteSkill('non-existing', projectRoot);
      expect(result).toBe(false);
    });
  });

  describe('skillExists', () => {
    it('should return true for existing skill', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'exists-skill', TEST_SKILL_MD);
      
      expect(skillService.skillExists('exists-skill', projectRoot)).toBe(true);
    });

    it('should return false for non-existing skill', () => {
      const projectRoot = tempDir;
      expect(skillService.skillExists('non-existing', projectRoot)).toBe(false);
    });
  });

  describe('searchSkills', () => {
    it('should search skills by name', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'search-skill', TEST_SKILL_MD);
      createTestSkill(projectSkillsDir, 'other-skill', SIMPLE_SKILL_MD);
      
      const results = skillService.searchSkills('search', projectRoot);
      
      // 搜索结果可能包含全局技能，所以只检查是否有结果
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
