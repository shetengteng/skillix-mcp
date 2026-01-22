/**
 * 配置服务测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as path from 'path';
import {
  setupTestEnv,
  cleanupTestEnv,
  TEST_BASE_DIR,
  TEST_PROJECT_DIR,
  TEST_GLOBAL_CONFIG_PATH,
  TEST_PROJECT_CONFIG_PATH,
  createTestFile,
} from '../helpers/setup.js';
import { TEST_SOURCE, TEST_CONFIG } from '../fixtures/skills.js';
import { DEFAULT_GLOBAL_CONFIG, DEFAULT_PROJECT_CONFIG } from '../../src/services/types.js';

// Mock paths module to use test directories
vi.mock('../../src/utils/paths.js', async () => {
  const actual = await vi.importActual('../../src/utils/paths.js');
  return {
    ...actual,
    getGlobalDir: () => TEST_BASE_DIR,
    getGlobalConfigPath: () => TEST_GLOBAL_CONFIG_PATH,
    getProjectDir: (projectRoot: string) => path.join(projectRoot, '.skillix'),
    getProjectConfigPath: (projectRoot: string) => path.join(projectRoot, '.skillix', 'config.json'),
  };
});

import { getGlobalConfig, saveGlobalConfig } from '../../src/services/config/global.js';
import { getProjectConfig, saveProjectConfig, initProjectConfig } from '../../src/services/config/project.js';
import { addSource, removeSource, getAllSources } from '../../src/services/config/source.js';
import * as fsUtils from '../../src/utils/fs.js';

describe('config service', () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    cleanupTestEnv();
    vi.clearAllMocks();
  });

  describe('global config', () => {
    describe('getGlobalConfig', () => {
      it('should return default config when no config exists', () => {
        const config = getGlobalConfig();
        
        expect(config.version).toBe(DEFAULT_GLOBAL_CONFIG.version);
        expect(config.defaultScope).toBe(DEFAULT_GLOBAL_CONFIG.defaultScope);
        expect(config.format).toBe(DEFAULT_GLOBAL_CONFIG.format);
      });

      it('should load existing config', () => {
        const customConfig = {
          ...DEFAULT_GLOBAL_CONFIG,
          format: 'json',
          autoSuggest: false,
        };
        createTestFile(TEST_GLOBAL_CONFIG_PATH, JSON.stringify(customConfig));
        
        const config = getGlobalConfig();
        
        expect(config.format).toBe('json');
        expect(config.autoSuggest).toBe(false);
      });

      it('should merge with defaults for missing fields', () => {
        const partialConfig = {
          format: 'json',
        };
        createTestFile(TEST_GLOBAL_CONFIG_PATH, JSON.stringify(partialConfig));
        
        const config = getGlobalConfig();
        
        expect(config.format).toBe('json');
        expect(config.version).toBe(DEFAULT_GLOBAL_CONFIG.version);
        expect(config.logging.level).toBe(DEFAULT_GLOBAL_CONFIG.logging.level);
      });
    });

    describe('saveGlobalConfig', () => {
      it('should save config to file', () => {
        const config = {
          ...DEFAULT_GLOBAL_CONFIG,
          format: 'json' as const,
        };
        
        saveGlobalConfig(config);
        
        const saved = fsUtils.readJson(TEST_GLOBAL_CONFIG_PATH);
        expect(saved).not.toBeNull();
        expect((saved as any).format).toBe('json');
      });

      it('should create directory if not exists', () => {
        fsUtils.removeDir(TEST_BASE_DIR);
        
        saveGlobalConfig(DEFAULT_GLOBAL_CONFIG);
        
        expect(fsUtils.exists(TEST_GLOBAL_CONFIG_PATH)).toBe(true);
      });
    });
  });

  describe('project config', () => {
    describe('getProjectConfig', () => {
      it('should return null when no config exists', () => {
        const config = getProjectConfig(TEST_PROJECT_DIR);
        
        expect(config).toBeNull();
      });

      it('should load existing project config', () => {
        const customConfig = {
          format: 'json',
          autoSuggest: false,
        };
        fsUtils.ensureDir(path.join(TEST_PROJECT_DIR, '.skillix'));
        createTestFile(TEST_PROJECT_CONFIG_PATH, JSON.stringify(customConfig));
        
        const config = getProjectConfig(TEST_PROJECT_DIR);
        
        expect(config).not.toBeNull();
        expect(config!.format).toBe('json');
        expect(config!.autoSuggest).toBe(false);
      });
    });

    describe('saveProjectConfig', () => {
      it('should save project config', () => {
        const config = {
          ...DEFAULT_PROJECT_CONFIG,
          format: 'json' as const,
        };
        
        saveProjectConfig(TEST_PROJECT_DIR, config);
        
        const saved = fsUtils.readJson(TEST_PROJECT_CONFIG_PATH);
        expect(saved).not.toBeNull();
        expect((saved as any).format).toBe('json');
      });
    });

    describe('initProjectConfig', () => {
      it('should initialize project with default config', () => {
        const newProjectDir = path.join(TEST_PROJECT_DIR, 'new-project');
        fsUtils.ensureDir(newProjectDir);
        
        initProjectConfig(newProjectDir);
        
        const configPath = path.join(newProjectDir, '.skillix', 'config.json');
        expect(fsUtils.exists(configPath)).toBe(true);
        
        const skillsDir = path.join(newProjectDir, '.skillix', 'skills');
        expect(fsUtils.isDirectory(skillsDir)).toBe(true);
      });

      it('should overwrite existing config', () => {
        const existingConfig = { format: 'json' };
        fsUtils.ensureDir(path.join(TEST_PROJECT_DIR, '.skillix'));
        createTestFile(TEST_PROJECT_CONFIG_PATH, JSON.stringify(existingConfig));
        
        initProjectConfig(TEST_PROJECT_DIR, { format: 'xml' });
        
        const config = fsUtils.readJson(TEST_PROJECT_CONFIG_PATH);
        expect((config as any).format).toBe('xml');
      });
    });
  });

  describe('source management', () => {
    describe('addSource', () => {
      it('should add a new source', () => {
        addSource(TEST_SOURCE, 'global');
        
        const config = getGlobalConfig();
        const added = config.sources.find(s => s.name === TEST_SOURCE.name);
        
        expect(added).toBeDefined();
        expect(added!.url).toBe(TEST_SOURCE.url);
      });

      it('should update duplicate source', () => {
        addSource(TEST_SOURCE, 'global');
        addSource({ ...TEST_SOURCE, branch: 'develop' }, 'global');
        
        const config = getGlobalConfig();
        const matches = config.sources.filter(s => s.name === TEST_SOURCE.name);
        
        expect(matches.length).toBe(1);
        expect(matches[0].branch).toBe('develop');
      });
    });

    describe('removeSource', () => {
      it('should remove existing source', () => {
        addSource(TEST_SOURCE, 'global');
        
        const result = removeSource(TEST_SOURCE.name, 'global');
        
        expect(result).toBe(true);
        const config = getGlobalConfig();
        const removed = config.sources.find(s => s.name === TEST_SOURCE.name);
        expect(removed).toBeUndefined();
      });

      it('should return false for non-existing source', () => {
        const result = removeSource('non-existing', 'global');
        expect(result).toBe(false);
      });
    });

    describe('getAllSources', () => {
      it('should list all sources', () => {
        const sources = getAllSources();
        
        // Should have at least the default official source
        expect(sources.length).toBeGreaterThanOrEqual(1);
      });

      it('should include added sources', () => {
        addSource(TEST_SOURCE, 'global');
        
        const sources = getAllSources();
        const found = sources.find(s => s.name === TEST_SOURCE.name);
        
        expect(found).toBeDefined();
      });
    });
  });
});
