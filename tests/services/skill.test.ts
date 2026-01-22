/**
 * 技能服务测试
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
import { TEST_SKILL, TEST_SKILL_2, PROJECT_SKILL, SKILL_MD_CONTENT } from '../fixtures/skills.js';

// Mock paths module to use test directories
vi.mock('../../src/utils/paths.js', async () => {
  const actual = await vi.importActual('../../src/utils/paths.js');
  return {
    ...actual,
    getGlobalDir: () => TEST_BASE_DIR,
    getGlobalSkillsDir: () => TEST_GLOBAL_SKILLS_DIR,
    getProjectSkillsDir: (projectRoot: string) => path.join(projectRoot, '.skillix', 'skills'),
  };
});

import { createSkill } from '../../src/services/skill/create.js';
import { deleteSkill } from '../../src/services/skill/delete.js';
import { skillExists } from '../../src/services/skill/exists.js';
import { getSkill } from '../../src/services/skill/get.js';
import { listGlobalSkills, listProjectSkills, listAllSkills } from '../../src/services/skill/list.js';
import { readSkillContent } from '../../src/services/skill/read.js';
import { updateSkill } from '../../src/services/skill/update.js';
import * as fsUtils from '../../src/utils/fs.js';

describe('skill service', () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    cleanupTestEnv();
    vi.clearAllMocks();
  });

  describe('createSkill', () => {
    it('should create a global skill with all directories', () => {
      const skill = createSkill(
        TEST_SKILL.name,
        TEST_SKILL.metadata,
        TEST_SKILL.body,
        'global'
      );

      expect(skill.name).toBe(TEST_SKILL.name);
      expect(skill.scope).toBe('global');
      expect(skill.metadata).toEqual(TEST_SKILL.metadata);
      
      // Verify directories created
      const skillDir = path.join(TEST_GLOBAL_SKILLS_DIR, TEST_SKILL.name);
      expect(fsUtils.isDirectory(skillDir)).toBe(true);
      expect(fsUtils.isDirectory(path.join(skillDir, 'scripts'))).toBe(true);
      expect(fsUtils.isDirectory(path.join(skillDir, 'references'))).toBe(true);
      expect(fsUtils.isDirectory(path.join(skillDir, 'assets'))).toBe(true);
      expect(fsUtils.isDirectory(path.join(skillDir, 'logs'))).toBe(true);
      
      // Verify SKILL.md created
      expect(fsUtils.isFile(path.join(skillDir, 'SKILL.md'))).toBe(true);
    });

    it('should create a project skill', () => {
      const skill = createSkill(
        PROJECT_SKILL.name,
        PROJECT_SKILL.metadata,
        PROJECT_SKILL.body,
        'project',
        TEST_PROJECT_DIR
      );

      expect(skill.name).toBe(PROJECT_SKILL.name);
      expect(skill.scope).toBe('project');
      
      const skillDir = path.join(TEST_PROJECT_SKILLS_DIR, PROJECT_SKILL.name);
      expect(fsUtils.isDirectory(skillDir)).toBe(true);
    });
  });

  describe('skillExists', () => {
    it('should return true for existing skill', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, TEST_SKILL.name, SKILL_MD_CONTENT);
      
      expect(skillExists(TEST_SKILL.name)).toBe(true);
    });

    it('should return false for non-existing skill', () => {
      expect(skillExists('non-existing-skill')).toBe(false);
    });

    it('should check project scope correctly', () => {
      createTestSkillDir(TEST_PROJECT_SKILLS_DIR, PROJECT_SKILL.name, SKILL_MD_CONTENT);
      
      expect(skillExists(PROJECT_SKILL.name, TEST_PROJECT_DIR)).toBe(true);
      expect(skillExists(PROJECT_SKILL.name)).toBe(false);
    });
  });

  describe('getSkill', () => {
    it('should get existing skill', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, TEST_SKILL.name, SKILL_MD_CONTENT);
      
      const skill = getSkill(TEST_SKILL.name);
      
      expect(skill).not.toBeNull();
      expect(skill!.name).toBe(TEST_SKILL.name);
      expect(skill!.metadata.description).toBe('用于单元测试的测试技能');
    });

    it('should return null for non-existing skill', () => {
      const skill = getSkill('non-existing');
      expect(skill).toBeNull();
    });
  });

  describe('listGlobalSkills', () => {
    it('should list all global skills', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, TEST_SKILL.name, SKILL_MD_CONTENT);
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, TEST_SKILL_2.name, `---
name: ${TEST_SKILL_2.name}
description: ${TEST_SKILL_2.metadata.description}
---

# Another Skill
`);
      
      const skills = listGlobalSkills();
      
      expect(skills.length).toBe(2);
      const names = skills.map(s => s.name);
      expect(names).toContain(TEST_SKILL.name);
      expect(names).toContain(TEST_SKILL_2.name);
    });

    it('should return empty array when no skills exist', () => {
      const skills = listGlobalSkills();
      expect(skills).toEqual([]);
    });
  });

  describe('listProjectSkills', () => {
    it('should list project skills', () => {
      createTestSkillDir(TEST_PROJECT_SKILLS_DIR, PROJECT_SKILL.name, `---
name: ${PROJECT_SKILL.name}
description: ${PROJECT_SKILL.metadata.description}
---

# Project Skill
`);
      
      const skills = listProjectSkills(TEST_PROJECT_DIR);
      
      expect(skills.length).toBe(1);
      expect(skills[0].name).toBe(PROJECT_SKILL.name);
    });

    it('should return empty array when no project skills exist', () => {
      const skills = listProjectSkills(TEST_PROJECT_DIR);
      expect(skills).toEqual([]);
    });
  });

  describe('listAllSkills', () => {
    it('should list both global and project skills', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, TEST_SKILL.name, SKILL_MD_CONTENT);
      createTestSkillDir(TEST_PROJECT_SKILLS_DIR, PROJECT_SKILL.name, `---
name: ${PROJECT_SKILL.name}
description: ${PROJECT_SKILL.metadata.description}
---

# Project Skill
`);
      
      const result = listAllSkills(TEST_PROJECT_DIR);
      
      expect(result.global_skills.length).toBe(1);
      expect(result.project_skills.length).toBe(1);
      expect(result.global_skills[0].name).toBe(TEST_SKILL.name);
      expect(result.project_skills[0].name).toBe(PROJECT_SKILL.name);
    });

    it('should handle no project root', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, TEST_SKILL.name, SKILL_MD_CONTENT);
      
      const result = listAllSkills();
      
      expect(result.global_skills.length).toBe(1);
      expect(result.project_skills.length).toBe(0);
    });
  });

  describe('readSkillContent', () => {
    it('should read skill content', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, TEST_SKILL.name, SKILL_MD_CONTENT);
      
      const content = readSkillContent(TEST_SKILL.name);
      
      expect(content).not.toBeNull();
      expect(content!.body).toContain('# 测试技能');
    });

    it('should return null for non-existing skill', () => {
      const content = readSkillContent('non-existing');
      expect(content).toBeNull();
    });
  });

  describe('updateSkill', () => {
    it('should update skill metadata', () => {
      createSkill(TEST_SKILL.name, TEST_SKILL.metadata, TEST_SKILL.body, 'global');
      
      const updated = updateSkill(TEST_SKILL.name, {
        metadata: {
          version: '2.0.0',
          description: 'Updated description for testing',
        },
      });
      
      expect(updated).not.toBeNull();
      expect(updated!.metadata.version).toBe('2.0.0');
      expect(updated!.metadata.description).toBe('Updated description for testing');
    });

    it('should update skill body', () => {
      createSkill(TEST_SKILL.name, TEST_SKILL.metadata, TEST_SKILL.body, 'global');
      
      const newBody = '# Updated Skill\n\nNew content here.';
      const updated = updateSkill(TEST_SKILL.name, { body: newBody });
      
      expect(updated).not.toBeNull();
      expect(updated!.content).toContain('New content here');
    });

    it('should return null when skill does not exist', () => {
      const result = updateSkill('non-existing', { metadata: TEST_SKILL.metadata });
      expect(result).toBeNull();
    });
  });

  describe('deleteSkill', () => {
    it('should delete existing skill', () => {
      createSkill(TEST_SKILL.name, TEST_SKILL.metadata, TEST_SKILL.body, 'global');
      
      const result = deleteSkill(TEST_SKILL.name);
      
      expect(result).toBe(true);
      expect(skillExists(TEST_SKILL.name)).toBe(false);
    });

    it('should return false when skill does not exist', () => {
      const result = deleteSkill('non-existing');
      expect(result).toBe(false);
    });

    it('should delete project skill', () => {
      createSkill(
        PROJECT_SKILL.name,
        PROJECT_SKILL.metadata,
        PROJECT_SKILL.body,
        'project',
        TEST_PROJECT_DIR
      );
      
      const result = deleteSkill(PROJECT_SKILL.name, TEST_PROJECT_DIR);
      
      expect(result).toBe(true);
      expect(skillExists(PROJECT_SKILL.name, TEST_PROJECT_DIR)).toBe(false);
    });
  });
});
