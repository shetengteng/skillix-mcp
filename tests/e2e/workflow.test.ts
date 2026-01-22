/**
 * 端到端工作流测试
 * 
 * 测试完整的业务流程，包括：
 * - 技能生命周期管理
 * - 配置工作流
 * - 项目级技能管理
 * - 多技能批量操作
 * - 混合作用域场景
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
  TEST_GLOBAL_CONFIG_PATH,
  TEST_PROJECT_CONFIG_PATH,
} from '../helpers/setup.js';

// Mock 路径模块，将所有路径重定向到测试目录
vi.mock('../../src/utils/paths.js', async () => {
  const actual = await vi.importActual('../../src/utils/paths.js');
  return {
    ...actual,
    getGlobalDir: () => TEST_BASE_DIR,
    getGlobalConfigPath: () => TEST_GLOBAL_CONFIG_PATH,
    getGlobalSkillsDir: () => TEST_GLOBAL_SKILLS_DIR,
    getProjectDir: (projectRoot: string) => path.join(projectRoot, '.skillix'),
    getProjectConfigPath: (projectRoot: string) => path.join(projectRoot, '.skillix', 'config.json'),
    getProjectSkillsDir: (projectRoot: string) => path.join(projectRoot, '.skillix', 'skills'),
  };
});

import { handleCreate } from '../../src/tools/skills/create.js';
import { handleRead } from '../../src/tools/skills/read.js';
import { handleUpdate } from '../../src/tools/skills/update.js';
import { handleDelete } from '../../src/tools/skills/delete.js';
import { handleList } from '../../src/tools/skills/list.js';
import { handleInit } from '../../src/tools/configs/init.js';
import { handleGet } from '../../src/tools/configs/get.js';
import { handleSet } from '../../src/tools/configs/set.js';

describe('端到端工作流测试', () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    cleanupTestEnv();
    vi.clearAllMocks();
  });

  describe('技能生命周期', () => {
    it('应该完成完整的技能生命周期：创建 -> 读取 -> 更新 -> 列表 -> 删除', async () => {
      const skillName = 'lifecycle-test';
      const initialDesc = '用于生命周期测试的初始描述';
      const updatedDesc = '用于生命周期测试的更新描述';

      // 步骤 1：创建技能
      const createResponse = await handleCreate({
        name: skillName,
        metadata: {
          name: skillName,
          description: initialDesc,
          version: '1.0.0',
        },
        body: '# 生命周期测试\n\n初始内容。',
        scope: 'global',
      });
      expect(createResponse.success).toBe(true);

      // 步骤 2：读取技能
      const readResponse = await handleRead({ name: skillName });
      expect(readResponse.success).toBe(true);
      // readSkillContent 返回 { metadata, body, scripts, references, assets }
      expect((readResponse.data as any).metadata.name).toBe(skillName);
      expect((readResponse.data as any).metadata.description).toBe(initialDesc);

      // 步骤 3：更新技能
      const updateResponse = await handleUpdate({
        name: skillName,
        metadata: {
          name: skillName,
          description: updatedDesc,
          version: '2.0.0',
        },
        body: '# 生命周期测试\n\n更新后的内容。',
        scope: 'global',
      });
      expect(updateResponse.success).toBe(true);

      // 步骤 4：验证更新
      const verifyResponse = await handleRead({ name: skillName });
      expect(verifyResponse.success).toBe(true);
      expect((verifyResponse.data as any).metadata.description).toBe(updatedDesc);
      expect((verifyResponse.data as any).metadata.version).toBe('2.0.0');

      // 步骤 5：列出技能
      const listResponse = await handleList({});
      expect(listResponse.success).toBe(true);
      const globalSkills = (listResponse.data as any).global_skills;
      expect(globalSkills.some((s: any) => s.name === skillName)).toBe(true);

      // 步骤 6：删除技能
      const deleteResponse = await handleDelete({
        name: skillName,
        scope: 'global',
      });
      expect(deleteResponse.success).toBe(true);

      // 步骤 7：验证删除
      const verifyDeleteResponse = await handleRead({ name: skillName });
      expect(verifyDeleteResponse.success).toBe(false);
    });
  });

  describe('配置工作流', () => {
    it('应该完成配置工作流：初始化 -> 设置 -> 获取', async () => {
      // 步骤 1：初始化项目
      const initResponse = await handleInit({
        projectRoot: TEST_PROJECT_DIR,
      });
      expect(initResponse.success).toBe(true);

      // 步骤 2：设置配置值
      const setResponse = await handleSet({
        scope: 'global',
        key: 'format',
        value: 'json',
      });
      expect(setResponse.success).toBe(true);

      // 步骤 3：获取配置值
      const getResponse = await handleGet({
        scope: 'global',
        key: 'format',
      });
      expect(getResponse.success).toBe(true);
      expect((getResponse.data as any).format).toBe('json');
    });
  });

  describe('项目级技能工作流', () => {
    it('应该管理项目级技能', async () => {
      // 步骤 1：初始化项目
      await handleInit({ projectRoot: TEST_PROJECT_DIR });

      // 步骤 2：创建项目技能
      const createResponse = await handleCreate({
        name: 'project-workflow-skill',
        metadata: {
          name: 'project-workflow-skill',
          description: '用于工作流测试的项目技能',
        },
        body: '# 项目工作流技能',
        scope: 'project',
        projectRoot: TEST_PROJECT_DIR,
      });
      expect(createResponse.success).toBe(true);

      // 步骤 3：列出项目技能
      const listResponse = await handleList({
        projectRoot: TEST_PROJECT_DIR,
      });
      expect(listResponse.success).toBe(true);
      const projectSkills = (listResponse.data as any).project_skills;
      expect(projectSkills.some((s: any) => s.name === 'project-workflow-skill')).toBe(true);

      // 步骤 4：读取项目技能
      const readResponse = await handleRead({
        name: 'project-workflow-skill',
        scope: 'project',
        projectRoot: TEST_PROJECT_DIR,
      });
      expect(readResponse.success).toBe(true);

      // 步骤 5：删除项目技能
      const deleteResponse = await handleDelete({
        name: 'project-workflow-skill',
        scope: 'project',
        projectRoot: TEST_PROJECT_DIR,
      });
      expect(deleteResponse.success).toBe(true);
    });
  });

  describe('多技能管理', () => {
    it('应该正确管理多个技能', async () => {
      const skills = [
        { name: 'skill-alpha', desc: '用于多技能测试的第一个技能' },
        { name: 'skill-beta', desc: '用于多技能测试的第二个技能' },
        { name: 'skill-gamma', desc: '用于多技能测试的第三个技能' },
      ];

      // 创建所有技能
      for (const skill of skills) {
        const response = await handleCreate({
          name: skill.name,
          metadata: {
            name: skill.name,
            description: skill.desc,
          },
          body: `# ${skill.name}`,
          scope: 'global',
        });
        expect(response.success).toBe(true);
      }

      // 列出并验证数量
      const listResponse = await handleList({});
      const globalSkills = (listResponse.data as any).global_skills;
      expect(globalSkills.length).toBe(skills.length);

      // 验证每个技能存在
      for (const skill of skills) {
        const readResponse = await handleRead({ name: skill.name });
        expect(readResponse.success).toBe(true);
      }

      // 删除所有技能
      for (const skill of skills) {
        const deleteResponse = await handleDelete({
          name: skill.name,
          scope: 'global',
        });
        expect(deleteResponse.success).toBe(true);
      }

      // 验证全部删除
      const finalListResponse = await handleList({});
      expect((finalListResponse.data as any).global_skills.length).toBe(0);
    });
  });

  describe('混合作用域技能', () => {
    it('应该同时处理全局和项目技能', async () => {
      // 初始化项目
      await handleInit({ projectRoot: TEST_PROJECT_DIR });

      // 创建全局技能
      await handleCreate({
        name: 'global-mixed',
        metadata: {
          name: 'global-mixed',
          description: '用于混合作用域测试的全局技能',
        },
        body: '# 全局混合技能',
        scope: 'global',
      });

      // 创建项目技能
      await handleCreate({
        name: 'project-mixed',
        metadata: {
          name: 'project-mixed',
          description: '用于混合作用域测试的项目技能',
        },
        body: '# 项目混合技能',
        scope: 'project',
        projectRoot: TEST_PROJECT_DIR,
      });

      // 列出所有技能
      const listResponse = await handleList({
        projectRoot: TEST_PROJECT_DIR,
      });
      
      expect(listResponse.success).toBe(true);
      const data = listResponse.data as any;
      expect(data.global_skills.some((s: any) => s.name === 'global-mixed')).toBe(true);
      expect(data.project_skills.some((s: any) => s.name === 'project-mixed')).toBe(true);

      // 清理
      await handleDelete({ name: 'global-mixed', scope: 'global' });
      await handleDelete({ name: 'project-mixed', scope: 'project', projectRoot: TEST_PROJECT_DIR });
    });
  });
});
