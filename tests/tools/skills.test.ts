/**
 * sx-skill 工具测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as path from 'path';
import {
  setupTestEnv,
  cleanupTestEnv,
  TEST_BASE_DIR,
  TEST_PROJECT_DIR,
  TEST_GLOBAL_SKILLS_DIR,
  TEST_PROJECT_SKILLS_DIR,
  createTestSkillDir,
} from '../helpers/setup.js';
import { TEST_SKILL, SKILL_MD_CONTENT } from '../fixtures/skills.js';

// Mock paths module
vi.mock('../../src/utils/paths.js', async () => {
  const actual = await vi.importActual('../../src/utils/paths.js');
  return {
    ...actual,
    getGlobalDir: () => TEST_BASE_DIR,
    getGlobalSkillsDir: () => TEST_GLOBAL_SKILLS_DIR,
    getProjectSkillsDir: (projectRoot: string) => path.join(projectRoot, '.skillix', 'skills'),
  };
});

import { handleList } from '../../src/tools/skills/list.js';
import { handleRead } from '../../src/tools/skills/read.js';
import { handleCreate } from '../../src/tools/skills/create.js';
import { handleUpdate } from '../../src/tools/skills/update.js';
import { handleDelete } from '../../src/tools/skills/delete.js';

describe('sx-skill tools', () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    cleanupTestEnv();
    vi.clearAllMocks();
  });

  describe('handleList', () => {
    it('should list all skills', async () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, TEST_SKILL.name, SKILL_MD_CONTENT);
      
      const response = await handleList({});
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });

    it('should return empty lists when no skills', async () => {
      const response = await handleList({});
      
      expect(response.success).toBe(true);
      const data = response.data as any;
      expect(data.global_skills).toEqual([]);
    });

    it('should filter by scope', async () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, TEST_SKILL.name, SKILL_MD_CONTENT);
      
      const response = await handleList({ scope: 'global' });
      
      expect(response.success).toBe(true);
    });
  });

  describe('handleRead', () => {
    it('should read existing skill', async () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, TEST_SKILL.name, SKILL_MD_CONTENT);
      
      const response = await handleRead({ name: TEST_SKILL.name });
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      const data = response.data as any;
      // readSkillContent 返回 { metadata, body, scripts, references, assets }
      expect(data.metadata).toBeDefined();
      expect(data.metadata.name).toBe(TEST_SKILL.name);
    });

    it('should return error for non-existing skill', async () => {
      const response = await handleRead({ name: 'non-existing' });
      
      expect(response.success).toBe(false);
      expect(response.message).toContain('不存在');
    });

    it('should require name parameter', async () => {
      const response = await handleRead({});
      
      expect(response.success).toBe(false);
      expect(response.errors).toBeDefined();
    });
  });

  describe('handleCreate', () => {
    it('should create a new skill', async () => {
      const response = await handleCreate({
        name: 'new-skill',
        metadata: {
          name: 'new-skill',
          description: 'A new skill for testing creation',
        },
        body: '# New Skill\n\nContent here.',
        scope: 'global',
      });
      
      expect(response.success).toBe(true);
      expect(response.message).toContain('成功创建技能');
    });

    it('should reject invalid skill name', async () => {
      const response = await handleCreate({
        name: 'Invalid_Name',
        metadata: {
          name: 'Invalid_Name',
          description: 'A skill with invalid name',
        },
        body: '# Test',
        scope: 'global',
      });
      
      expect(response.success).toBe(false);
    });

    it('should reject existing skill', async () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, TEST_SKILL.name, SKILL_MD_CONTENT);
      
      const response = await handleCreate({
        name: TEST_SKILL.name,
        metadata: TEST_SKILL.metadata,
        body: TEST_SKILL.body,
        scope: 'global',
      });
      
      expect(response.success).toBe(false);
      expect(response.message).toContain('已存在');
    });

    it('should require metadata', async () => {
      const response = await handleCreate({
        name: 'test-skill',
        scope: 'global',
      });
      
      expect(response.success).toBe(false);
    });
  });

  describe('handleUpdate', () => {
    it('should update existing skill metadata', async () => {
      // First create the skill
      await handleCreate({
        name: 'update-test',
        metadata: {
          name: 'update-test',
          description: 'Original description for update testing',
        },
        body: '# Original',
        scope: 'global',
      });
      
      // Then update it
      const response = await handleUpdate({
        name: 'update-test',
        metadata: {
          name: 'update-test',
          description: 'Updated description for update testing',
          version: '2.0.0',
        },
        scope: 'global',
      });
      
      expect(response.success).toBe(true);
    });

    it('should update skill body', async () => {
      await handleCreate({
        name: 'body-update',
        metadata: {
          name: 'body-update',
          description: 'Testing body update functionality',
        },
        body: '# Original Body',
        scope: 'global',
      });
      
      const response = await handleUpdate({
        name: 'body-update',
        body: '# Updated Body\n\nNew content here.',
        scope: 'global',
      });
      
      expect(response.success).toBe(true);
    });

    it('should return error for non-existing skill', async () => {
      const response = await handleUpdate({
        name: 'non-existing',
        metadata: {
          name: 'non-existing',
          description: 'Trying to update non-existing skill',
        },
        scope: 'global',
      });
      
      expect(response.success).toBe(false);
    });
  });

  describe('handleDelete', () => {
    it('should delete existing skill', async () => {
      await handleCreate({
        name: 'to-delete',
        metadata: {
          name: 'to-delete',
          description: 'A skill to be deleted in testing',
        },
        body: '# To Delete',
        scope: 'global',
      });
      
      const response = await handleDelete({
        name: 'to-delete',
        scope: 'global',
      });
      
      expect(response.success).toBe(true);
      expect(response.message).toContain('成功删除技能');
    });

    it('should return error for non-existing skill', async () => {
      const response = await handleDelete({
        name: 'non-existing',
        scope: 'global',
      });
      
      expect(response.success).toBe(false);
    });

    it('should require name parameter', async () => {
      const response = await handleDelete({});
      
      expect(response.success).toBe(false);
    });
  });
});




