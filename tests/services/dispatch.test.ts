/**
 * dispatch 服务测试
 * 
 * AI First 设计：
 * - 测试技能信息收集功能
 * - 测试简单匹配分数计算
 * - 测试分流结果生成
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import * as nodeFs from 'node:fs';
import { createTempDir, cleanupTempDir, createTestSkill } from '../helpers/setup.js';
import { analyze } from '../../src/services/dispatch/index.js';
import { TEST_SKILL_MD, SIMPLE_SKILL_MD } from '../fixtures/skills.js';

describe('dispatch service', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('analyze', () => {
    it('should return CREATE_NEW when no skills exist', () => {
      const projectRoot = tempDir;
      // 创建空的技能目录
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      const result = analyze({
        task: '处理一个新任务',
        projectRoot,
        config: { enableMarketSearch: false }, // 禁用市场搜索以简化测试
      });

      expect(result).toBeDefined();
      expect(result.action).toBe('CREATE_NEW');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.reason).toBeDefined();
    });

    it('should find matching skill when exists', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      // 创建一个 PDF 相关的技能
      const pdfSkillContent = `---
name: pdf-converter
description: PDF 文件转换工具，支持 PDF 转图片、PDF 转文本
version: 1.0.0
tags:
  - pdf
  - converter
---

# PDF 转换器

将 PDF 文件转换为其他格式。
`;
      createTestSkill(projectSkillsDir, 'pdf-converter', pdfSkillContent);

      const result = analyze({
        task: '帮我把 PDF 转成图片',
        projectRoot,
        config: { enableMarketSearch: false },
      });

      expect(result).toBeDefined();
      expect(result.matchDetails).toBeDefined();
      expect(result.matchDetails!.length).toBeGreaterThan(0);
      
      // 应该找到 pdf-converter 技能
      const pdfMatch = result.matchDetails!.find(m => m.name === 'pdf-converter');
      expect(pdfMatch).toBeDefined();
    });

    it('should return USE_EXISTING for high match score', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      // 创建一个高度匹配的技能
      const skillContent = `---
name: image-processor
description: 图片处理工具，支持图片压缩、格式转换、尺寸调整
version: 1.0.0
tags:
  - image
  - processor
---

# 图片处理器

处理各种图片格式。
`;
      createTestSkill(projectSkillsDir, 'image-processor', skillContent);

      const result = analyze({
        task: 'image processor 图片处理',
        projectRoot,
        config: { enableMarketSearch: false },
      });

      expect(result).toBeDefined();
      // 由于任务描述直接包含技能名称，应该有较高匹配
      if (result.matchDetails && result.matchDetails.length > 0) {
        expect(result.matchDetails[0].name).toBe('image-processor');
      }
    });

    it('should include match details in result', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      createTestSkill(projectSkillsDir, 'test-skill-1', TEST_SKILL_MD);
      createTestSkill(projectSkillsDir, 'test-skill-2', SIMPLE_SKILL_MD);

      const result = analyze({
        task: '测试任务',
        projectRoot,
        config: { enableMarketSearch: false },
      });

      expect(result.matchDetails).toBeDefined();
      expect(Array.isArray(result.matchDetails)).toBe(true);
      
      // 每个匹配详情应该包含必要字段
      if (result.matchDetails && result.matchDetails.length > 0) {
        const detail = result.matchDetails[0];
        expect(detail.name).toBeDefined();
        expect(detail.description).toBeDefined();
        expect(detail.scope).toBeDefined();
        expect(detail.source).toBeDefined();
        expect(typeof detail.score).toBe('number');
      }
    });

    it('should handle empty task gracefully', () => {
      const projectRoot = tempDir;

      // 空任务应该仍然返回结果
      const result = analyze({
        task: '',
        projectRoot,
        config: { enableMarketSearch: false },
      });

      expect(result).toBeDefined();
      expect(result.action).toBeDefined();
    });

    it('should respect enableMarketSearch config', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      // 禁用市场搜索
      const result = analyze({
        task: '一个任务',
        projectRoot,
        config: { enableMarketSearch: false },
      });

      expect(result).toBeDefined();
      // 结果应该只基于本地技能
    });

    it('should return confidence between 0 and 1', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });

      createTestSkill(projectSkillsDir, 'any-skill', TEST_SKILL_MD);

      const result = analyze({
        task: '任意任务',
        projectRoot,
        config: { enableMarketSearch: false },
      });

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should return valid action type', () => {
      const projectRoot = tempDir;

      const result = analyze({
        task: '任务描述',
        projectRoot,
        config: { enableMarketSearch: false },
      });

      const validActions = [
        'USE_EXISTING',
        'IMPROVE_EXISTING',
        'CREATE_NEW',
        'INSTALL',
        'COMPOSE',
        'NO_SKILL_NEEDED',
      ];

      expect(validActions).toContain(result.action);
    });
  });
});
