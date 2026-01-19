/**
 * sx-config 工具测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import * as nodeFs from 'node:fs';
import { createTempDir, cleanupTempDir } from '../helpers/setup.js';
import { sxConfig } from '../../src/tools/configs/index.js';

describe('sx-config tool', () => {
  let tempDir: string;
  let originalHome: string | undefined;

  beforeEach(() => {
    tempDir = createTempDir();
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    
    // 创建全局配置目录
    const globalConfigDir = path.join(tempDir, '.skillix');
    nodeFs.mkdirSync(globalConfigDir, { recursive: true });
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
    process.env.HOME = originalHome;
  });

  describe('get action', () => {
    it('should get global config', () => {
      const result = sxConfig({ action: 'get', scope: 'global' });
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should get project config', () => {
      const projectRoot = path.join(tempDir, 'project');
      const projectConfigDir = path.join(projectRoot, '.skillix');
      nodeFs.mkdirSync(projectConfigDir, { recursive: true });
      nodeFs.writeFileSync(
        path.join(projectConfigDir, 'config.json'),
        JSON.stringify({ sources: [], format: 'xml' })
      );
      
      const result = sxConfig({
        action: 'get',
        scope: 'project',
        projectRoot,
      });
      
      expect(result.success).toBe(true);
    });

    it('should get effective config', () => {
      const result = sxConfig({ action: 'get', scope: 'effective' });
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('set action', () => {
    it('should set global config value', () => {
      const result = sxConfig({
        action: 'set',
        scope: 'global',
        key: 'autoSuggest',
        value: false,  // 使用布尔值而非字符串
      });
      
      expect(result.success).toBe(true);
    });

    it('should fail without key parameter', () => {
      const result = sxConfig({
        action: 'set',
        scope: 'global',
        value: 'test',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('init action', () => {
    it('should initialize project config', () => {
      const projectRoot = path.join(tempDir, 'project');
      nodeFs.mkdirSync(projectRoot, { recursive: true });
      
      const result = sxConfig({
        action: 'init',
        projectRoot,
      });
      
      expect(result.success).toBe(true);
      
      const configPath = path.join(projectRoot, '.skillix', 'config.json');
      expect(nodeFs.existsSync(configPath)).toBe(true);
    });

    it('should fail without projectRoot', () => {
      const result = sxConfig({ action: 'init' });
      
      expect(result.success).toBe(false);
    });
  });

  describe('sources action', () => {
    it('should list sources', () => {
      const result = sxConfig({ action: 'sources' });
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('unknown action', () => {
    it('should fail for unknown action', () => {
      const result = sxConfig({ action: 'unknown' as any });
      
      expect(result.success).toBe(false);
    });
  });
});
