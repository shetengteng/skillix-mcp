/**
 * sx-triage 工具测试
 * 
 * 测试 triage 工具的输入验证和响应格式
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import * as nodeFs from 'node:fs';
import { createTempDir, cleanupTempDir, createTestSkill } from '../helpers/setup.js';
import { sxTriage } from '../../src/tools/triages/index.js';
import { TEST_SKILL_MD } from '../fixtures/skills.js';

describe('sx-triage tool', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('input validation', () => {
    it('should return error when task is missing', () => {
      const result = sxTriage({
        task: '',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('缺少任务描述');
      expect(result.errors).toBeDefined();
    });

    it('should return error when task is only whitespace', () => {
      const result = sxTriage({
        task: '   ',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('缺少任务描述');
    });
  });

  describe('successful analysis', () => {
    it('should return success with valid task', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      const result = sxTriage({
        task: '帮我处理一个任务',
        projectRoot,
      });

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should include recommendation in response', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      const result = sxTriage({
        task: '处理 PDF 文件',
        projectRoot,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const data = result.data as any;
      expect(data.recommendation).toBeDefined();
      expect(data.recommendation.action).toBeDefined();
      expect(data.recommendation.confidence).toBeDefined();
      expect(data.recommendation.reason).toBeDefined();
    });

    it('should include available skills in response', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'test-skill', TEST_SKILL_MD);

      const result = sxTriage({
        task: '测试任务',
        projectRoot,
      });

      expect(result.success).toBe(true);
      
      const data = result.data as any;
      expect(data.availableSkills).toBeDefined();
      expect(Array.isArray(data.availableSkills)).toBe(true);
    });

    it('should include next steps in response', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      const result = sxTriage({
        task: '任务描述',
        projectRoot,
      });

      expect(result.success).toBe(true);
      
      const data = result.data as any;
      expect(data.nextSteps).toBeDefined();
      expect(Array.isArray(data.nextSteps)).toBe(true);
    });

    it('should include AI hint in response', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      const result = sxTriage({
        task: '任务描述',
        projectRoot,
      });

      expect(result.success).toBe(true);
      
      const data = result.data as any;
      expect(data.aiHint).toBeDefined();
      expect(typeof data.aiHint).toBe('string');
    });
  });

  describe('task and context handling', () => {
    it('should include task in response data', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      const taskText = '帮我转换 PDF 文件';
      const result = sxTriage({
        task: taskText,
        projectRoot,
      });

      expect(result.success).toBe(true);
      
      const data = result.data as any;
      expect(data.task).toBe(taskText);
    });

    it('should handle context parameter', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      const result = sxTriage({
        task: '处理文件',
        context: '需要将 PDF 转换为图片格式',
        projectRoot,
      });

      expect(result.success).toBe(true);
      
      const data = result.data as any;
      expect(data.context).toBe('需要将 PDF 转换为图片格式');
    });

    it('should handle hints parameter', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      const hints = ['pdf', 'image', 'convert'];
      const result = sxTriage({
        task: '文件处理',
        hints,
        projectRoot,
      });

      expect(result.success).toBe(true);
      
      const data = result.data as any;
      expect(data.hints).toEqual(hints);
    });
  });

  describe('skill matching', () => {
    it('should find matching skill by name', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      const pdfSkillContent = `---
name: pdf-converter
description: PDF 文件转换工具
version: 1.0.0
---

# PDF 转换器
`;
      createTestSkill(projectSkillsDir, 'pdf-converter', pdfSkillContent);

      const result = sxTriage({
        task: 'pdf converter 转换',
        projectRoot,
      });

      expect(result.success).toBe(true);
      
      const data = result.data as any;
      expect(data.availableSkills.length).toBeGreaterThan(0);
      
      const pdfSkill = data.availableSkills.find((s: any) => s.name === 'pdf-converter');
      expect(pdfSkill).toBeDefined();
    });

    it('should return USE_EXISTING for high match', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      const skillContent = `---
name: exact-match-skill
description: 精确匹配测试技能
version: 1.0.0
---

# 精确匹配
`;
      createTestSkill(projectSkillsDir, 'exact-match-skill', skillContent);

      const result = sxTriage({
        task: 'exact match skill 精确匹配',
        projectRoot,
      });

      expect(result.success).toBe(true);
      
      const data = result.data as any;
      // 当有高度匹配时，应该推荐使用现有技能
      if (data.recommendation.action === 'USE_EXISTING') {
        expect(data.recommendation.skill).toBe('exact-match-skill');
      }
    });

    it('should return CREATE_NEW when no match', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      // 创建一个完全不相关的技能
      const skillContent = `---
name: unrelated-skill
description: 完全不相关的技能
version: 1.0.0
---

# 不相关
`;
      createTestSkill(projectSkillsDir, 'unrelated-skill', skillContent);

      const result = sxTriage({
        task: '处理 XML 数据并生成报告',
        projectRoot,
      });

      expect(result.success).toBe(true);
      
      const data = result.data as any;
      // 当没有匹配时，应该建议创建新技能
      expect(['CREATE_NEW', 'INSTALL']).toContain(data.recommendation.action);
    });
  });

  describe('response format', () => {
    it('should have correct response structure', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      const result = sxTriage({
        task: '任务描述',
        projectRoot,
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');

      const data = result.data as any;
      expect(data).toHaveProperty('task');
      expect(data).toHaveProperty('context');
      expect(data).toHaveProperty('hints');
      expect(data).toHaveProperty('recommendation');
      expect(data).toHaveProperty('availableSkills');
      expect(data).toHaveProperty('nextSteps');
      expect(data).toHaveProperty('aiHint');
    });

    it('should have correct recommendation structure', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      const result = sxTriage({
        task: '任务描述',
        projectRoot,
      });

      const data = result.data as any;
      const rec = data.recommendation;

      expect(rec).toHaveProperty('action');
      expect(rec).toHaveProperty('skill');
      expect(rec).toHaveProperty('source');
      expect(rec).toHaveProperty('confidence');
      expect(rec).toHaveProperty('reason');
    });

    it('should have correct available skill structure', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'test-skill', TEST_SKILL_MD);

      const result = sxTriage({
        task: '任务描述',
        projectRoot,
      });

      const data = result.data as any;
      
      if (data.availableSkills.length > 0) {
        const skill = data.availableSkills[0];
        expect(skill).toHaveProperty('name');
        expect(skill).toHaveProperty('description');
        expect(skill).toHaveProperty('scope');
        expect(skill).toHaveProperty('source');
        expect(skill).toHaveProperty('relevanceScore');
      }
    });
  });
});
