/**
 * 性能测试
 * 
 * 测试覆盖：
 * - 批量技能创建性能
 * - 技能列表查询性能
 * - 技能搜索性能
 * - 配置读写性能
 * - 并发操作性能
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
} from '../helpers/setup.js';

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

import { createSkill } from '../../src/services/skill/create.js';
import { deleteSkill } from '../../src/services/skill/delete.js';
import { listGlobalSkills, listAllSkills } from '../../src/services/skill/list.js';
import { getSkill } from '../../src/services/skill/get.js';
import { searchSkills } from '../../src/services/skill/search.js';
import { getGlobalConfig, saveGlobalConfig } from '../../src/services/config/global.js';
import { DEFAULT_GLOBAL_CONFIG } from '../../src/services/types.js';

/**
 * 测量函数执行时间
 */
function measureTime<T>(fn: () => T): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * 测量异步函数执行时间
 */
async function measureTimeAsync<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

describe('性能测试', () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    cleanupTestEnv();
    vi.clearAllMocks();
  });

  describe('批量技能创建', () => {
    it('应该在合理时间内创建 10 个技能', () => {
      const { duration } = measureTime(() => {
        for (let i = 0; i < 10; i++) {
          createSkill(
            `perf-skill-${i}`,
            {
              name: `perf-skill-${i}`,
              description: `性能测试技能 ${i}，用于测试批量创建性能`,
            },
            `# 性能测试技能 ${i}\n\n这是第 ${i} 个测试技能。`,
            'global'
          );
        }
      });

      console.log(`创建 10 个技能耗时: ${duration.toFixed(2)}ms`);
      // 10 个技能应该在 5 秒内完成
      expect(duration).toBeLessThan(5000);
    });

    it('应该在合理时间内创建 50 个技能', () => {
      const { duration } = measureTime(() => {
        for (let i = 0; i < 50; i++) {
          createSkill(
            `batch-skill-${i}`,
            {
              name: `batch-skill-${i}`,
              description: `批量测试技能 ${i}，用于测试大量创建性能`,
            },
            `# 批量测试技能 ${i}`,
            'global'
          );
        }
      });

      console.log(`创建 50 个技能耗时: ${duration.toFixed(2)}ms`);
      // 50 个技能应该在 15 秒内完成
      expect(duration).toBeLessThan(15000);
    });
  });

  describe('技能列表查询', () => {
    beforeEach(() => {
      // 预先创建一些技能
      for (let i = 0; i < 20; i++) {
        createSkill(
          `list-perf-${i}`,
          {
            name: `list-perf-${i}`,
            description: `列表性能测试技能 ${i}`,
          },
          `# 列表测试 ${i}`,
          'global'
        );
      }
    });

    it('列出 20 个技能应该在 500ms 内完成', () => {
      const { result, duration } = measureTime(() => {
        return listGlobalSkills();
      });

      console.log(`列出 ${result.length} 个技能耗时: ${duration.toFixed(2)}ms`);
      expect(result.length).toBe(20);
      expect(duration).toBeLessThan(500);
    });

    it('多次列表查询应该保持稳定性能', () => {
      const durations: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const { duration } = measureTime(() => listGlobalSkills());
        durations.push(duration);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      
      console.log(`平均耗时: ${avgDuration.toFixed(2)}ms, 最大耗时: ${maxDuration.toFixed(2)}ms`);
      
      // 平均应该在 200ms 内
      expect(avgDuration).toBeLessThan(200);
      // 最大不应超过 500ms
      expect(maxDuration).toBeLessThan(500);
    });
  });

  describe('技能获取', () => {
    beforeEach(() => {
      // 创建测试技能
      for (let i = 0; i < 10; i++) {
        createSkill(
          `get-perf-${i}`,
          {
            name: `get-perf-${i}`,
            description: `获取性能测试技能 ${i}`,
          },
          `# 获取测试 ${i}`,
          'global'
        );
      }
    });

    it('获取单个技能应该在 100ms 内完成', () => {
      const { result, duration } = measureTime(() => {
        return getSkill('get-perf-5');
      });

      console.log(`获取单个技能耗时: ${duration.toFixed(2)}ms`);
      expect(result).not.toBeNull();
      expect(duration).toBeLessThan(100);
    });

    it('连续获取多个技能应该保持性能', () => {
      const { duration } = measureTime(() => {
        for (let i = 0; i < 10; i++) {
          getSkill(`get-perf-${i}`);
        }
      });

      console.log(`连续获取 10 个技能耗时: ${duration.toFixed(2)}ms`);
      // 平均每个应该在 50ms 内
      expect(duration).toBeLessThan(500);
    });
  });

  describe('技能搜索', () => {
    beforeEach(() => {
      // 创建不同类型的技能
      const skillTypes = ['pdf', 'image', 'code', 'data', 'api'];
      for (const type of skillTypes) {
        for (let i = 0; i < 5; i++) {
          createSkill(
            `${type}-processor-${i}`,
            {
              name: `${type}-processor-${i}`,
              description: `${type} 处理工具 ${i}，用于处理 ${type} 相关任务`,
              tags: [type, 'processor', 'tool'],
            },
            `# ${type} 处理器 ${i}`,
            'global'
          );
        }
      }
    });

    it('搜索应该在 500ms 内返回结果', () => {
      const { result, duration } = measureTime(() => {
        return searchSkills('pdf');
      });

      console.log(`搜索 "pdf" 耗时: ${duration.toFixed(2)}ms, 找到 ${result.length} 个结果`);
      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(500);
    });

    it('多次搜索应该保持稳定性能', () => {
      const queries = ['pdf', 'image', 'code', 'data', 'api'];
      const durations: number[] = [];

      for (const query of queries) {
        const { duration } = measureTime(() => searchSkills(query));
        durations.push(duration);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      console.log(`平均搜索耗时: ${avgDuration.toFixed(2)}ms`);
      
      expect(avgDuration).toBeLessThan(300);
    });
  });

  describe('配置读写', () => {
    it('读取配置应该在 50ms 内完成', () => {
      const { duration } = measureTime(() => {
        return getGlobalConfig();
      });

      console.log(`读取配置耗时: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(50);
    });

    it('写入配置应该在 100ms 内完成', () => {
      const { duration } = measureTime(() => {
        saveGlobalConfig({
          ...DEFAULT_GLOBAL_CONFIG,
          format: 'json',
        });
      });

      console.log(`写入配置耗时: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(100);
    });

    it('连续读写应该保持性能', () => {
      const { duration } = measureTime(() => {
        for (let i = 0; i < 20; i++) {
          const config = getGlobalConfig();
          saveGlobalConfig({
            ...config,
            format: i % 2 === 0 ? 'json' : 'xml',
          });
        }
      });

      console.log(`20 次配置读写耗时: ${duration.toFixed(2)}ms`);
      // 平均每次应该在 50ms 内
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('批量删除', () => {
    beforeEach(() => {
      // 创建测试技能
      for (let i = 0; i < 20; i++) {
        createSkill(
          `delete-perf-${i}`,
          {
            name: `delete-perf-${i}`,
            description: `删除性能测试技能 ${i}`,
          },
          `# 删除测试 ${i}`,
          'global'
        );
      }
    });

    it('批量删除 20 个技能应该在 3 秒内完成', () => {
      const { duration } = measureTime(() => {
        for (let i = 0; i < 20; i++) {
          deleteSkill(`delete-perf-${i}`);
        }
      });

      console.log(`删除 20 个技能耗时: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(3000);

      // 验证全部删除
      const remaining = listGlobalSkills();
      expect(remaining.length).toBe(0);
    });
  });

  describe('内存使用', () => {
    it('大量操作后不应有明显内存泄漏', () => {
      // 获取初始内存使用
      const initialMemory = process.memoryUsage().heapUsed;

      // 执行大量操作
      for (let round = 0; round < 5; round++) {
        // 创建
        for (let i = 0; i < 10; i++) {
          createSkill(
            `memory-test-${round}-${i}`,
            {
              name: `memory-test-${round}-${i}`,
              description: `内存测试技能 ${round}-${i}`,
            },
            `# 内存测试 ${round}-${i}`,
            'global'
          );
        }

        // 列表
        listGlobalSkills();

        // 搜索
        searchSkills('memory');

        // 删除
        for (let i = 0; i < 10; i++) {
          deleteSkill(`memory-test-${round}-${i}`);
        }
      }

      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }

      // 获取最终内存使用
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;

      console.log(`内存增长: ${memoryIncrease.toFixed(2)}MB`);
      
      // 内存增长不应超过 50MB
      expect(memoryIncrease).toBeLessThan(50);
    });
  });
});
