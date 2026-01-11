/**
 * sx-skill 工具测试
 * 注意：由于全局路径依赖 os.homedir()，这里主要测试项目级技能
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import * as nodeFs from 'node:fs';
import { createTempDir, cleanupTempDir, createTestSkill } from '../helpers/setup.js';
import { sxSkill } from '../../src/tools/skills/index.js';
import { TEST_SKILL_MD, SIMPLE_SKILL_MD } from '../fixtures/skills.js';

describe('sx-skill tool', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
    // 创建项目技能目录
    const projectSkillsDir = path.join(tempDir, '.skillix', 'skills');
    nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('list action', () => {
    it('should list project skills', () => {
      const projectSkillsDir = path.join(tempDir, '.skillix', 'skills');
      createTestSkill(projectSkillsDir, 'skill-1', TEST_SKILL_MD);
      createTestSkill(projectSkillsDir, 'skill-2', SIMPLE_SKILL_MD);
      
      const result = sxSkill({ action: 'list', projectRoot: tempDir });
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should list skills with scope filter', () => {
      const projectSkillsDir = path.join(tempDir, '.skillix', 'skills');
      createTestSkill(projectSkillsDir, 'project-skill', TEST_SKILL_MD);
      
      const result = sxSkill({ action: 'list', scope: 'project', projectRoot: tempDir });
      
      expect(result.success).toBe(true);
    });
  });

  describe('read action', () => {
    it('should read existing project skill', () => {
      const projectSkillsDir = path.join(tempDir, '.skillix', 'skills');
      createTestSkill(projectSkillsDir, 'read-skill', TEST_SKILL_MD);
      
      const result = sxSkill({ action: 'read', name: 'read-skill', projectRoot: tempDir });
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should fail without name parameter', () => {
      const result = sxSkill({ action: 'read' });
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should fail for non-existing skill', () => {
      const result = sxSkill({ action: 'read', name: 'non-existing', projectRoot: tempDir });
      
      expect(result.success).toBe(false);
    });
  });

  describe('create action', () => {
    it('should create new project skill', () => {
      // 使用唯一名称避免与全局技能冲突
      const uniqueName = `test-skill-${Date.now()}`;
      const result = sxSkill({
        action: 'create',
        name: uniqueName,
        metadata: {
          name: uniqueName,
          description: 'A new skill',
        },
        body: '# New Skill\n\nContent here.',
        scope: 'project',
        projectRoot: tempDir,
      });
      
      expect(result.success).toBe(true);
      
      const skillDir = path.join(tempDir, '.skillix', 'skills', uniqueName);
      expect(nodeFs.existsSync(skillDir)).toBe(true);
    });

    it('should fail without name parameter', () => {
      const result = sxSkill({
        action: 'create',
        metadata: {
          name: 'test',
          description: 'test',
        },
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('update action', () => {
    it('should update existing project skill', () => {
      const projectSkillsDir = path.join(tempDir, '.skillix', 'skills');
      createTestSkill(projectSkillsDir, 'update-skill', TEST_SKILL_MD);
      
      const result = sxSkill({
        action: 'update',
        name: 'update-skill',
        metadata: {
          name: 'update-skill',
          description: 'Updated description',
        },
        projectRoot: tempDir,
      });
      
      expect(result.success).toBe(true);
    });

    it('should fail without name parameter', () => {
      const result = sxSkill({ action: 'update' });
      
      expect(result.success).toBe(false);
    });

    it('should fail for non-existing skill', () => {
      const result = sxSkill({
        action: 'update',
        name: 'non-existing',
        metadata: {
          name: 'non-existing',
          description: 'Updated',
        },
        projectRoot: tempDir,
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('delete action', () => {
    it('should delete existing project skill', () => {
      const projectSkillsDir = path.join(tempDir, '.skillix', 'skills');
      createTestSkill(projectSkillsDir, 'delete-skill', TEST_SKILL_MD);
      
      const result = sxSkill({
        action: 'delete',
        name: 'delete-skill',
        projectRoot: tempDir,
      });
      
      expect(result.success).toBe(true);
      
      const skillDir = path.join(projectSkillsDir, 'delete-skill');
      expect(nodeFs.existsSync(skillDir)).toBe(false);
    });

    it('should fail without name parameter', () => {
      const result = sxSkill({ action: 'delete' });
      
      expect(result.success).toBe(false);
    });

    it('should fail for non-existing skill', () => {
      const result = sxSkill({
        action: 'delete',
        name: 'non-existing',
        projectRoot: tempDir,
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('unknown action', () => {
    it('should fail for unknown action', () => {
      const result = sxSkill({ action: 'unknown' as any });
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});
