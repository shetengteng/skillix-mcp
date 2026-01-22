/**
 * sx-config 工具测试
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
} from '../helpers/setup.js';

// Mock paths module
vi.mock('../../src/utils/paths.js', async () => {
  const actual = await vi.importActual('../../src/utils/paths.js');
  return {
    ...actual,
    getGlobalDir: () => TEST_BASE_DIR,
    getGlobalConfigPath: () => TEST_GLOBAL_CONFIG_PATH,
    getProjectDir: (projectRoot: string) => path.join(projectRoot, '.skillix'),
    getProjectConfigPath: (projectRoot: string) => path.join(projectRoot, '.skillix', 'config.json'),
    getProjectSkillsDir: (projectRoot: string) => path.join(projectRoot, '.skillix', 'skills'),
  };
});

import { handleGet } from '../../src/tools/configs/get.js';
import { handleSet } from '../../src/tools/configs/set.js';
import { handleInit } from '../../src/tools/configs/init.js';
import { handleSources } from '../../src/tools/configs/sources.js';

describe('sx-config tools', () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    cleanupTestEnv();
    vi.clearAllMocks();
  });

  describe('handleGet', () => {
    it('should get all global config', async () => {
      const response = await handleGet({ scope: 'global' });
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });

    it('should get specific config key', async () => {
      const response = await handleGet({
        scope: 'global',
        key: 'format',
      });
      
      expect(response.success).toBe(true);
    });

    it('should return error for invalid key', async () => {
      const response = await handleGet({
        scope: 'global',
        key: 'invalidKey',
      });
      
      expect(response.success).toBe(false);
    });
  });

  describe('handleSet', () => {
    it('should set global config value', async () => {
      const response = await handleSet({
        scope: 'global',
        key: 'format',
        value: 'json',
      });
      
      expect(response.success).toBe(true);
      
      // Verify the change
      const getResponse = await handleGet({ scope: 'global', key: 'format' });
      expect((getResponse.data as any).format).toBe('json');
    });

    it('should set boolean config value', async () => {
      const response = await handleSet({
        scope: 'global',
        key: 'autoSuggest',
        value: false,
      });
      
      expect(response.success).toBe(true);
    });

    it('should reject invalid config value', async () => {
      const response = await handleSet({
        scope: 'global',
        key: 'format',
        value: 'invalid',
      });
      
      expect(response.success).toBe(false);
    });

    it('should require key and value', async () => {
      const response = await handleSet({ scope: 'global' });
      
      expect(response.success).toBe(false);
    });
  });

  describe('handleInit', () => {
    it('should initialize project config', async () => {
      const response = await handleInit({
        projectRoot: TEST_PROJECT_DIR,
      });
      
      expect(response.success).toBe(true);
      expect(response.message).toContain('初始化');
    });

    it('should handle already initialized project', async () => {
      // Initialize once
      await handleInit({ projectRoot: TEST_PROJECT_DIR });
      
      // Initialize again
      const response = await handleInit({ projectRoot: TEST_PROJECT_DIR });
      
      // Should still succeed (idempotent)
      expect(response.success).toBe(true);
    });
  });

  describe('handleSources', () => {
    describe('list', () => {
      it('should list all sources', async () => {
        const response = await handleSources({
          sourceAction: 'list',
        });
        
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(Array.isArray((response.data as any).sources)).toBe(true);
      });
    });

    describe('add', () => {
      it('should add a new source', async () => {
        const response = await handleSources({
          sourceAction: 'add',
          source: {
            name: 'test-source',
            url: 'https://github.com/test/skills',
            branch: 'main',
          },
        });
        
        expect(response.success).toBe(true);
        
        // Verify added
        const listResponse = await handleSources({ sourceAction: 'list' });
        const sources = (listResponse.data as any).sources;
        const found = sources.find((s: any) => s.name === 'test-source');
        expect(found).toBeDefined();
      });

      it('should require source parameter', async () => {
        const response = await handleSources({
          sourceAction: 'add',
        });
        
        expect(response.success).toBe(false);
      });
    });

    describe('remove', () => {
      it('should remove existing source', async () => {
        // First add a source
        await handleSources({
          sourceAction: 'add',
          source: {
            name: 'to-remove',
            url: 'https://github.com/test/to-remove',
          },
        });
        
        // Then remove it
        const response = await handleSources({
          sourceAction: 'remove',
          sourceName: 'to-remove',
        });
        
        expect(response.success).toBe(true);
      });

      it('should return error for non-existing source', async () => {
        const response = await handleSources({
          sourceAction: 'remove',
          sourceName: 'non-existing-source',
        });
        
        expect(response.success).toBe(false);
      });

      it('should require sourceName parameter', async () => {
        const response = await handleSources({
          sourceAction: 'remove',
        });
        
        expect(response.success).toBe(false);
      });
    });
  });
});
