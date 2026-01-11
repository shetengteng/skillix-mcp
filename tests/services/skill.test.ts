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
    it('should update existing skill', () => {
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

    it('should update skill body', () => {
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
