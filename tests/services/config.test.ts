/**
 * config 服务测试
 * 注意：由于全局路径依赖 os.homedir()，这里主要测试项目级配置
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import * as nodeFs from 'node:fs';
import { createTempDir, cleanupTempDir } from '../helpers/setup.js';
import * as configService from '../../src/services/config/index.js';

describe('config service', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('getGlobalConfig', () => {
    it('should return config with required properties', () => {
      const config = configService.getGlobalConfig();
      
      expect(config).toHaveProperty('sources');
      expect(config).toHaveProperty('version');
      expect(Array.isArray(config.sources)).toBe(true);
    });
  });

  describe('getProjectConfig', () => {
    it('should return null when no project config exists', () => {
      const projectRoot = tempDir;
      
      const config = configService.getProjectConfig(projectRoot);
      
      expect(config).toBeNull();
    });

    it('should read existing project config', () => {
      const projectRoot = tempDir;
      const configDir = path.join(projectRoot, '.skillix');
      const configPath = path.join(configDir, 'config.json');
      nodeFs.mkdirSync(configDir, { recursive: true });
      
      const projectConfig = {
        sources: [{ name: 'project-source', type: 'local', path: './skills' }],
        format: 'xml',
        autoSuggest: true,
      };
      nodeFs.writeFileSync(configPath, JSON.stringify(projectConfig));
      
      const config = configService.getProjectConfig(projectRoot);
      
      expect(config).not.toBeNull();
      expect(config?.sources).toBeDefined();
    });
  });

  describe('saveProjectConfig', () => {
    it('should save project config', () => {
      const projectRoot = tempDir;
      
      const config = {
        sources: [{ name: 'local', type: 'local' as const, path: './skills' }],
        format: 'xml' as const,
        autoSuggest: true,
      };
      
      configService.saveProjectConfig(projectRoot, config);
      
      const configPath = path.join(projectRoot, '.skillix', 'config.json');
      expect(nodeFs.existsSync(configPath)).toBe(true);
      
      const savedConfig = JSON.parse(nodeFs.readFileSync(configPath, 'utf-8'));
      expect(savedConfig.format).toBe('xml');
    });
  });

  describe('initProjectConfig', () => {
    it('should initialize project config', () => {
      const projectRoot = tempDir;
      
      const result = configService.initProjectConfig(projectRoot);
      
      expect(result).toBeDefined();
      expect(result.format).toBeDefined();
      
      const configPath = path.join(projectRoot, '.skillix', 'config.json');
      expect(nodeFs.existsSync(configPath)).toBe(true);
    });

    it('should create skills directory', () => {
      const projectRoot = tempDir;
      
      configService.initProjectConfig(projectRoot);
      
      const skillsDir = path.join(projectRoot, '.skillix', 'skills');
      expect(nodeFs.existsSync(skillsDir)).toBe(true);
    });

    it('should accept custom options', () => {
      const projectRoot = tempDir;
      
      const result = configService.initProjectConfig(projectRoot, {
        format: 'json',
        autoSuggest: false,
      });
      
      expect(result.format).toBe('json');
      expect(result.autoSuggest).toBe(false);
    });
  });

  describe('getEffectiveConfig', () => {
    it('should return effective config', () => {
      const projectRoot = tempDir;
      
      const { effective, global, project } = configService.getEffectiveConfig(projectRoot);
      
      expect(global).toBeDefined();
      expect(effective).toBeDefined();
      expect(effective.sources).toBeDefined();
    });

    it('should use project config when available', () => {
      const projectRoot = tempDir;
      const configDir = path.join(projectRoot, '.skillix');
      nodeFs.mkdirSync(configDir, { recursive: true });
      nodeFs.writeFileSync(
        path.join(configDir, 'config.json'),
        JSON.stringify({
          sources: [{ name: 'project-source', type: 'local', path: './local' }],
          format: 'json',
        })
      );
      
      const { effective, project } = configService.getEffectiveConfig(projectRoot);
      
      expect(project).not.toBeNull();
      expect(effective.format).toBe('json');
    });
  });

  describe('addSource', () => {
    it('should add source to project config', () => {
      const projectRoot = tempDir;
      configService.initProjectConfig(projectRoot);
      
      const source = { name: 'new-source', type: 'local' as const, path: '/new/path' };
      
      configService.addSource(source, 'project', projectRoot);
      
      const config = configService.getProjectConfig(projectRoot);
      const found = config?.sources?.find(s => s.name === 'new-source');
      expect(found).toBeDefined();
    });
  });

  describe('removeSource', () => {
    it('should remove source from project config', () => {
      const projectRoot = tempDir;
      configService.initProjectConfig(projectRoot);
      
      // 先添加一个源
      const source = { name: 'to-remove', type: 'local' as const, path: '/remove/path' };
      configService.addSource(source, 'project', projectRoot);
      
      // 然后移除
      const result = configService.removeSource('to-remove', 'project', projectRoot);
      
      expect(result).toBe(true);
      
      const config = configService.getProjectConfig(projectRoot);
      const found = config?.sources?.find(s => s.name === 'to-remove');
      expect(found).toBeUndefined();
    });

    it('should return false for non-existing source', () => {
      const projectRoot = tempDir;
      configService.initProjectConfig(projectRoot);
      
      const result = configService.removeSource('non-existing', 'project', projectRoot);
      
      expect(result).toBe(false);
    });
  });

  describe('getAllSources', () => {
    it('should return all effective sources', () => {
      const sources = configService.getAllSources();
      
      expect(Array.isArray(sources)).toBe(true);
    });
  });
});
