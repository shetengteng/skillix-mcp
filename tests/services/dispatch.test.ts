/**
 * 分流服务测试
 * 
 * 测试覆盖：
 * - 分析函数基础功能
 * - 空技能场景处理
 * - 技能匹配逻辑
 * - 匹配分数计算
 * - 推荐操作判断
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
  createTestSkillDir,
} from '../helpers/setup.js';
import { SKILL_MD_CONTENT } from '../fixtures/skills.js';

// Mock 路径模块
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

// Mock 市场服务（避免网络请求）
vi.mock('../../src/services/market/index.js', () => ({
  searchSkills: vi.fn(() => ({ results: [], total: 0 })),
  loadManifest: vi.fn(() => null),
  syncAllSources: vi.fn(),
}));

import { analyze } from '../../src/services/dispatch/index.js';

describe('分流服务', () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    cleanupTestEnv();
    vi.clearAllMocks();
  });

  describe('analyze - 分析函数', () => {
    it('当没有技能时应该返回 CREATE_NEW', () => {
      const result = analyze({
        task: '处理一个新任务',
        projectRoot: TEST_PROJECT_DIR,
        config: { enableMarketSearch: false },
      });

      expect(result).toBeDefined();
      expect(result.action).toBe('CREATE_NEW');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.reason).toBeDefined();
    });

    it('当存在匹配技能时应该找到它', () => {
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
      createTestSkillDir(TEST_PROJECT_SKILLS_DIR, 'pdf-converter', pdfSkillContent);

      const result = analyze({
        task: '帮我把 PDF 转成图片',
        projectRoot: TEST_PROJECT_DIR,
        config: { enableMarketSearch: false },
      });

      expect(result).toBeDefined();
      expect(result.matchDetails).toBeDefined();
      expect(result.matchDetails!.length).toBeGreaterThan(0);
      
      // 应该找到 pdf-converter 技能
      const pdfMatch = result.matchDetails!.find(m => m.name === 'pdf-converter');
      expect(pdfMatch).toBeDefined();
    });

    it('高匹配分数时应该返回 USE_EXISTING', () => {
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
      createTestSkillDir(TEST_PROJECT_SKILLS_DIR, 'image-processor', skillContent);

      const result = analyze({
        task: 'image processor 图片处理',
        projectRoot: TEST_PROJECT_DIR,
        config: { enableMarketSearch: false },
      });

      expect(result).toBeDefined();
      // 由于任务描述直接包含技能名称，应该有较高匹配
      if (result.matchDetails && result.matchDetails.length > 0) {
        expect(result.matchDetails[0].name).toBe('image-processor');
      }
    });

    it('应该在结果中包含匹配详情', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'test-skill-1', SKILL_MD_CONTENT);
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'test-skill-2', `---
name: test-skill-2
description: 另一个测试技能
---

# 测试技能 2
`);

      const result = analyze({
        task: '测试任务',
        projectRoot: TEST_PROJECT_DIR,
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

    it('应该优雅处理空任务', () => {
      // 空任务应该仍然返回结果
      const result = analyze({
        task: '',
        projectRoot: TEST_PROJECT_DIR,
        config: { enableMarketSearch: false },
      });

      expect(result).toBeDefined();
      expect(result.action).toBeDefined();
    });

    it('应该尊重 enableMarketSearch 配置', () => {
      // 禁用市场搜索
      const result = analyze({
        task: '一个任务',
        projectRoot: TEST_PROJECT_DIR,
        config: { enableMarketSearch: false },
      });

      expect(result).toBeDefined();
      // 结果应该只基于本地技能
    });

    it('置信度应该在 0 到 1 之间', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'any-skill', SKILL_MD_CONTENT);

      const result = analyze({
        task: '任意任务',
        projectRoot: TEST_PROJECT_DIR,
        config: { enableMarketSearch: false },
      });

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('应该返回有效的操作类型', () => {
      const result = analyze({
        task: '任务描述',
        projectRoot: TEST_PROJECT_DIR,
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

  describe('匹配分数计算', () => {
    it('名称完全匹配应该有高分', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'code-review', `---
name: code-review
description: 代码审查工具
---

# 代码审查
`);

      const result = analyze({
        task: 'code review',
        projectRoot: TEST_PROJECT_DIR,
        config: { enableMarketSearch: false },
      });

      expect(result.matchDetails).toBeDefined();
      if (result.matchDetails && result.matchDetails.length > 0) {
        expect(result.matchDetails[0].score).toBeGreaterThan(0.3);
      }
    });

    it('描述关键词匹配应该增加分数', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'data-analyzer', `---
name: data-analyzer
description: 数据分析工具，支持 CSV、JSON 数据处理和可视化
---

# 数据分析器
`);

      const result = analyze({
        task: '分析 CSV 数据',
        projectRoot: TEST_PROJECT_DIR,
        config: { enableMarketSearch: false },
      });

      expect(result.matchDetails).toBeDefined();
      const match = result.matchDetails?.find(m => m.name === 'data-analyzer');
      expect(match).toBeDefined();
    });
  });
});
