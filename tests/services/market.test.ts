/**
 * Market 服务测试
 * 
 * 注意：这些测试需要网络访问，用于从 GitHub 克隆技能仓库
 * 使用 https://github.com/anthropics/skills 作为测试源
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import * as path from 'node:path';
import * as nodeFs from 'node:fs';
import { createTempDir, cleanupTempDir } from '../helpers/setup.js';
import * as marketService from '../../src/services/market/index.js';
import * as configService from '../../src/services/config/index.js';

// 测试用的技能源 URL
const TEST_SOURCE_URL = 'https://github.com/anthropics/skills';
const TEST_SOURCE_NAME = 'anthropics-skills';

describe('market service', () => {
  let tempDir: string;
  let originalHome: string | undefined;

  beforeAll(() => {
    // 保存原始 HOME 环境变量
    originalHome = process.env.HOME;
  });

  afterAll(() => {
    // 恢复原始 HOME 环境变量
    if (originalHome) {
      process.env.HOME = originalHome;
    }
  });

  beforeEach(() => {
    tempDir = createTempDir();
    // 设置临时 HOME 目录，避免影响真实的全局配置
    process.env.HOME = tempDir;
    
    // 创建全局 skillix 目录
    const skillixDir = path.join(tempDir, '.skillix');
    nodeFs.mkdirSync(skillixDir, { recursive: true });
    nodeFs.mkdirSync(path.join(skillixDir, 'skills'), { recursive: true });
    nodeFs.mkdirSync(path.join(skillixDir, 'cache'), { recursive: true });
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('URL parsing', () => {
    it('should parse GitHub URL correctly', () => {
      const result = marketService.parseGitUrl(TEST_SOURCE_URL);
      
      expect(result).not.toBeNull();
      expect(result?.host).toBe('github.com');
      expect(result?.owner).toBe('anthropics');
      expect(result?.repo).toBe('skills');
    });

    it('should generate correct source ID', () => {
      const result = marketService.parseGitUrl(TEST_SOURCE_URL);
      
      // sourceId 格式: host/owner/repo
      expect(result?.sourceId).toBe('github.com/anthropics/skills');
    });

    it('should handle invalid URL', () => {
      const result = marketService.parseGitUrl('not-a-valid-url');
      
      expect(result).toBeNull();
    });
  });

  describe('cache paths', () => {
    it('should return correct repos cache dir', () => {
      const cacheDir = marketService.getReposCacheDir();
      
      expect(cacheDir).toContain('.skillix');
      expect(cacheDir).toContain('cache');
      expect(cacheDir).toContain('repos');
    });

    it('should return correct indexes cache dir', () => {
      const indexesDir = marketService.getIndexesCacheDir();
      
      expect(indexesDir).toContain('.skillix');
      expect(indexesDir).toContain('cache');
      expect(indexesDir).toContain('indexes');
    });

    it('should return correct manifest path', () => {
      const manifestPath = marketService.getManifestPath();
      
      expect(manifestPath).toContain('.skillix');
      expect(manifestPath).toContain('cache');
      expect(manifestPath).toContain('manifest.json');
    });
  });

  describe('source ID conversion', () => {
    it('should convert source ID to dir name', () => {
      // sourceId: github.com/anthropics/skills -> dirName: github.com_anthropics_skills
      const dirName = marketService.sourceIdToDirName('github.com/anthropics/skills');
      
      expect(dirName).toBe('github.com_anthropics_skills');
    });

    it('should convert dir name to source ID', () => {
      // dirName: github.com_anthropics_skills -> sourceId: github.com/anthropics/skills
      const sourceId = marketService.dirNameToSourceId('github.com_anthropics_skills');
      
      expect(sourceId).toBe('github.com/anthropics/skills');
    });
  });

  // 以下测试需要网络访问，可以通过环境变量控制是否运行
  describe.skipIf(!process.env.RUN_NETWORK_TESTS)('network tests', () => {
    describe('syncSource', () => {
      it('should sync source from GitHub', async () => {
        // 添加测试源到配置
        const source = {
          name: TEST_SOURCE_NAME,
          url: TEST_SOURCE_URL,
          branch: 'main',
          default: false,
        };
        
        configService.addSource(source, 'global');
        
        // 同步源
        const result = await marketService.syncSource(source);
        
        expect(result.status).toBe('synced');
        expect(result.skillCount).toBeGreaterThan(0);
      }, 60000); // 60 秒超时
    });

    describe('searchSkills', () => {
      it('should search skills after sync', async () => {
        // 先同步源
        const source = {
          name: TEST_SOURCE_NAME,
          url: TEST_SOURCE_URL,
          branch: 'main',
          default: false,
        };
        
        configService.addSource(source, 'global');
        await marketService.syncSource(source);
        
        // 搜索技能
        const results = await marketService.searchSkills({ query: 'skill' });
        
        expect(results.length).toBeGreaterThan(0);
      }, 60000);
    });

    describe('installSkill', () => {
      it('should install skill from synced source', async () => {
        // 先同步源
        const source = {
          name: TEST_SOURCE_NAME,
          url: TEST_SOURCE_URL,
          branch: 'main',
          default: false,
        };
        
        configService.addSource(source, 'global');
        await marketService.syncSource(source);
        
        // 搜索获取一个技能名
        const searchResults = await marketService.searchSkills({ query: '' });
        
        if (searchResults.length > 0) {
          const skillName = searchResults[0].name;
          
          // 安装技能
          const result = await marketService.installSkill({
            name: skillName,
            scope: 'global',
          });
          
          expect(result.success).toBe(true);
          expect(result.name).toBe(skillName);
        }
      }, 60000);
    });
  });

  // 不需要网络的测试
  describe('manifest operations', () => {
    it('should update and load manifest', () => {
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

    it('should remove source from manifest', () => {
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
  });

  describe('source index operations', () => {
    it('should save and load source index', () => {
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
            description: 'A test skill',
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
  });

  describe('installed record operations', () => {
    it('should return null or empty record when no skills installed', () => {
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

    it('should check if skill is installed', () => {
      const isInstalled = marketService.isSkillInstalled('non-existing-skill', 'global');
      
      expect(isInstalled).toBe(false);
    });
  });

  describe('status operations', () => {
    it('should return status with summary', () => {
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

    it('should filter by source name', () => {
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
});
