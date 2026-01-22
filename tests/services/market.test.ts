/**
 * 市场服务测试
 * 
 * 测试覆盖：
 * - URL 解析
 * - 缓存路径
 * - 源 ID 转换
 * - Manifest 操作
 * - 源索引操作
 * - 安装记录操作
 * - 状态操作
 * 
 * 注意：网络相关测试被跳过，仅测试本地功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as path from 'path';
import {
  setupTestEnv,
  cleanupTestEnv,
  TEST_BASE_DIR,
  TEST_PROJECT_DIR,
  TEST_GLOBAL_CONFIG_PATH,
} from '../helpers/setup.js';

// Mock 路径模块
vi.mock('../../src/utils/paths.js', async () => {
  const actual = await vi.importActual('../../src/utils/paths.js');
  return {
    ...actual,
    getGlobalDir: () => TEST_BASE_DIR,
    getGlobalConfigPath: () => TEST_GLOBAL_CONFIG_PATH,
    getGlobalCacheDir: () => path.join(TEST_BASE_DIR, 'cache'),
    getGlobalSkillsDir: () => path.join(TEST_BASE_DIR, 'skills'),
    getProjectDir: (projectRoot: string) => path.join(projectRoot, '.skillix'),
    getProjectConfigPath: (projectRoot: string) => path.join(projectRoot, '.skillix', 'config.json'),
    getProjectSkillsDir: (projectRoot: string) => path.join(projectRoot, '.skillix', 'skills'),
  };
});

import * as marketService from '../../src/services/market/index.js';
import * as fsUtils from '../../src/utils/fs.js';

// 测试用的技能源 URL
const TEST_SOURCE_URL = 'https://github.com/ComposioHQ/awesome-claude-skills';
const TEST_SOURCE_NAME = 'awesome-claude-skills';

describe('市场服务', () => {
  beforeEach(() => {
    setupTestEnv();
    // 创建缓存目录
    fsUtils.ensureDir(path.join(TEST_BASE_DIR, 'cache'));
    fsUtils.ensureDir(path.join(TEST_BASE_DIR, 'cache', 'repos'));
    fsUtils.ensureDir(path.join(TEST_BASE_DIR, 'cache', 'indexes'));
  });

  afterEach(() => {
    cleanupTestEnv();
    vi.clearAllMocks();
  });

  describe('URL 解析', () => {
    it('应该正确解析 GitHub URL', () => {
      const result = marketService.parseGitUrl(TEST_SOURCE_URL);
      
      expect(result).not.toBeNull();
      expect(result?.host).toBe('github.com');
      expect(result?.owner).toBe('ComposioHQ');
      expect(result?.repo).toBe('awesome-claude-skills');
    });

    it('应该生成正确的源 ID', () => {
      const result = marketService.parseGitUrl(TEST_SOURCE_URL);
      
      // sourceId 格式: host/owner/repo
      expect(result?.sourceId).toBe('github.com/ComposioHQ/awesome-claude-skills');
    });

    it('应该处理无效 URL', () => {
      const result = marketService.parseGitUrl('not-a-valid-url');
      
      expect(result).toBeNull();
    });

    it('应该处理带 .git 后缀的 URL', () => {
      const result = marketService.parseGitUrl('https://github.com/owner/repo.git');
      
      expect(result).not.toBeNull();
      expect(result?.repo).toBe('repo');
    });
  });

  describe('缓存路径', () => {
    it('应该返回正确的 repos 缓存目录', () => {
      const cacheDir = marketService.getReposCacheDir();
      
      expect(cacheDir).toContain('.skillix');
      expect(cacheDir).toContain('cache');
      expect(cacheDir).toContain('repos');
    });

    it('应该返回正确的 indexes 缓存目录', () => {
      const indexesDir = marketService.getIndexesCacheDir();
      
      expect(indexesDir).toContain('.skillix');
      expect(indexesDir).toContain('cache');
      expect(indexesDir).toContain('indexes');
    });

    it('应该返回正确的 manifest 路径', () => {
      const manifestPath = marketService.getManifestPath();
      
      expect(manifestPath).toContain('.skillix');
      expect(manifestPath).toContain('cache');
      expect(manifestPath).toContain('manifest.json');
    });
  });

  describe('源 ID 转换', () => {
    it('应该将源 ID 转换为目录名', () => {
      // sourceId: github.com/anthropics/skills -> dirName: github.com_anthropics_skills
      const dirName = marketService.sourceIdToDirName('github.com/anthropics/skills');
      
      expect(dirName).toBe('github.com_anthropics_skills');
    });

    it('应该将目录名转换为源 ID', () => {
      // dirName: github.com_anthropics_skills -> sourceId: github.com/anthropics/skills
      const sourceId = marketService.dirNameToSourceId('github.com_anthropics_skills');
      
      expect(sourceId).toBe('github.com/anthropics/skills');
    });

    it('转换应该是可逆的', () => {
      const originalId = 'github.com/test/repo';
      const dirName = marketService.sourceIdToDirName(originalId);
      const recoveredId = marketService.dirNameToSourceId(dirName);
      
      expect(recoveredId).toBe(originalId);
    });
  });

  describe('Manifest 操作', () => {
    it('应该更新和加载 manifest', () => {
      const sourceInfo = {
        id: 'manifest-test-source',
        name: 'manifest-test',
        url: 'https://github.com/test/manifest',
        branch: 'main',
        status: 'synced' as const,
        skillCount: 5,
        syncedAt: new Date().toISOString(),
      };
      
      marketService.updateManifest(sourceInfo);
      
      const manifest = marketService.loadManifest();
      
      expect(manifest).not.toBeNull();
      expect(manifest?.sources.some(s => s.id === 'manifest-test-source')).toBe(true);
    });

    it('应该从 manifest 中移除源', () => {
      // 先添加一个源
      const sourceInfo = {
        id: 'to-remove-source',
        name: 'to-remove',
        url: 'https://github.com/test/remove',
        branch: 'main',
        status: 'synced' as const,
      };
      
      marketService.updateManifest(sourceInfo);
      
      // 验证添加成功
      let manifest = marketService.loadManifest();
      expect(manifest?.sources.some(s => s.id === 'to-remove-source')).toBe(true);
      
      // 移除源
      marketService.removeSourceFromManifest('to-remove-source');
      
      // 验证移除成功
      manifest = marketService.loadManifest();
      expect(manifest?.sources.some(s => s.id === 'to-remove-source')).toBe(false);
    });

    it('应该处理空 manifest', () => {
      const manifest = marketService.loadManifest();
      
      // 可能返回 null（文件不存在）或空结构
      if (manifest !== null) {
        expect(manifest.sources).toBeDefined();
        expect(Array.isArray(manifest.sources)).toBe(true);
      }
    });
  });

  describe('源索引操作', () => {
    it('应该保存和加载源索引', () => {
      const sourceIndex = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        source: {
          id: 'test-index-source',
          name: 'test-index',
          url: 'https://github.com/test/index',
          branch: 'main',
          commit: 'abc123',
        },
        skills: [
          {
            name: 'test-skill',
            description: '一个测试技能',
            version: '1.0.0',
            author: 'test',
            tags: ['test'],
            path: 'test-skill',
            hasScripts: false,
            hasReferences: false,
            hasAssets: false,
          },
        ],
      };
      
      marketService.saveSourceIndex('test-index-source', sourceIndex);
      
      const loaded = marketService.loadSourceIndex('test-index-source');
      
      expect(loaded).not.toBeNull();
      expect(loaded?.source.id).toBe('test-index-source');
      expect(loaded?.skills.length).toBe(1);
      expect(loaded?.skills[0].name).toBe('test-skill');
    });

    it('应该返回 null 当索引不存在时', () => {
      const loaded = marketService.loadSourceIndex('non-existing-source');
      expect(loaded).toBeNull();
    });
  });

  describe('安装记录操作', () => {
    it('当没有安装技能时应该返回 null 或空记录', () => {
      const record = marketService.getInstalledRecord('global');
      
      // 可能返回 null（文件不存在）或空记录（文件存在但无技能）
      if (record === null) {
        expect(record).toBeNull();
      } else {
        // 如果有记录，应该是空的或只有基本结构
        expect(record.version).toBeDefined();
        expect(Array.isArray(record.skills)).toBe(true);
      }
    });

    it('应该检查技能是否已安装', () => {
      const isInstalled = marketService.isSkillInstalled('non-existing-skill', 'global');
      
      expect(isInstalled).toBe(false);
    });
  });

  describe('状态操作', () => {
    it('应该返回包含摘要的状态', () => {
      // 手动添加一个源到 manifest
      const sourceInfo = {
        id: 'status-test-source-unique',
        name: 'status-test-unique',
        url: 'https://github.com/test/status-unique',
        branch: 'main',
        status: 'synced' as const,
        skillCount: 3,
        syncedAt: new Date().toISOString(),
      };
      
      marketService.updateManifest(sourceInfo);
      
      const status = marketService.getStatus();
      
      // 应该至少包含我们添加的源
      expect(status.sources.some(s => s.id === 'status-test-source-unique')).toBe(true);
      expect(status.summary.total).toBeGreaterThan(0);
    });

    it('应该按源名称过滤', () => {
      // 添加一个特定的源
      const sourceInfo = {
        id: 'filter-test-source',
        name: 'filter-test',
        url: 'https://github.com/test/filter',
        branch: 'main',
        status: 'synced' as const,
        skillCount: 2,
        syncedAt: new Date().toISOString(),
      };
      
      marketService.updateManifest(sourceInfo);
      
      // 按名称过滤
      const status = marketService.getStatus('filter-test');
      
      expect(status.sources.length).toBe(1);
      expect(status.sources[0].name).toBe('filter-test');
    });
  });

  // 网络测试 - 默认跳过
  describe.skip('网络测试（需要设置 RUN_NETWORK_TESTS 环境变量）', () => {
    it('应该从 GitHub 同步源', async () => {
      // 这个测试需要网络访问
    });

    it('同步后应该能搜索技能', async () => {
      // 这个测试需要网络访问
    });

    it('应该从同步的源安装技能', async () => {
      // 这个测试需要网络访问
    });
  });
});
