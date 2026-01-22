/**
 * 路径工具函数测试
 */

import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { homedir } from 'os';
import {
  getGlobalDir,
  getGlobalConfigPath,
  getGlobalSkillsDir,
  getGlobalCacheDir,
  getGlobalLogsDir,
  getProjectDir,
  getProjectConfigPath,
  getProjectSkillsDir,
  getProjectLogsDir,
  getSkillDir,
  getSkillMdPath,
  getSkillScriptsDir,
  getSkillReferencesDir,
  getSkillAssetsDir,
  getSkillLogsDir,
  isAbsolutePath,
  normalizePath,
  getRelativePath,
} from '../../src/utils/paths.js';

describe('paths utils', () => {
  describe('global paths', () => {
    it('getGlobalDir should return ~/.skillix', () => {
      const expected = path.join(homedir(), '.skillix');
      expect(getGlobalDir()).toBe(expected);
    });

    it('getGlobalConfigPath should return ~/.skillix/config.json', () => {
      const expected = path.join(homedir(), '.skillix', 'config.json');
      expect(getGlobalConfigPath()).toBe(expected);
    });

    it('getGlobalSkillsDir should return ~/.skillix/skills', () => {
      const expected = path.join(homedir(), '.skillix', 'skills');
      expect(getGlobalSkillsDir()).toBe(expected);
    });

    it('getGlobalCacheDir should return ~/.skillix/cache', () => {
      const expected = path.join(homedir(), '.skillix', 'cache');
      expect(getGlobalCacheDir()).toBe(expected);
    });

    it('getGlobalLogsDir should return ~/.skillix/logs', () => {
      const expected = path.join(homedir(), '.skillix', 'logs');
      expect(getGlobalLogsDir()).toBe(expected);
    });
  });

  describe('project paths', () => {
    const projectRoot = '/test/project';

    it('getProjectDir should return .skillix under project root', () => {
      const expected = path.join(projectRoot, '.skillix');
      expect(getProjectDir(projectRoot)).toBe(expected);
    });

    it('getProjectConfigPath should return config.json under .skillix', () => {
      const expected = path.join(projectRoot, '.skillix', 'config.json');
      expect(getProjectConfigPath(projectRoot)).toBe(expected);
    });

    it('getProjectSkillsDir should return skills under .skillix', () => {
      const expected = path.join(projectRoot, '.skillix', 'skills');
      expect(getProjectSkillsDir(projectRoot)).toBe(expected);
    });

    it('getProjectLogsDir should return logs under .skillix', () => {
      const expected = path.join(projectRoot, '.skillix', 'logs');
      expect(getProjectLogsDir(projectRoot)).toBe(expected);
    });
  });

  describe('skill paths', () => {
    const skillsDir = '/test/skills';
    const skillName = 'my-skill';
    const skillDir = path.join(skillsDir, skillName);

    it('getSkillDir should return skill directory path', () => {
      expect(getSkillDir(skillsDir, skillName)).toBe(skillDir);
    });

    it('getSkillMdPath should return SKILL.md path', () => {
      const expected = path.join(skillDir, 'SKILL.md');
      expect(getSkillMdPath(skillDir)).toBe(expected);
    });

    it('getSkillScriptsDir should return scripts directory path', () => {
      const expected = path.join(skillDir, 'scripts');
      expect(getSkillScriptsDir(skillDir)).toBe(expected);
    });

    it('getSkillReferencesDir should return references directory path', () => {
      const expected = path.join(skillDir, 'references');
      expect(getSkillReferencesDir(skillDir)).toBe(expected);
    });

    it('getSkillAssetsDir should return assets directory path', () => {
      const expected = path.join(skillDir, 'assets');
      expect(getSkillAssetsDir(skillDir)).toBe(expected);
    });

    it('getSkillLogsDir should return logs directory path', () => {
      const expected = path.join(skillDir, 'logs');
      expect(getSkillLogsDir(skillDir)).toBe(expected);
    });
  });

  describe('path utilities', () => {
    it('isAbsolutePath should return true for absolute paths', () => {
      expect(isAbsolutePath('/absolute/path')).toBe(true);
      expect(isAbsolutePath('/Users/test')).toBe(true);
    });

    it('isAbsolutePath should return false for relative paths', () => {
      expect(isAbsolutePath('relative/path')).toBe(false);
      expect(isAbsolutePath('./relative')).toBe(false);
      expect(isAbsolutePath('../parent')).toBe(false);
    });

    it('normalizePath should normalize paths', () => {
      expect(normalizePath('/test/../foo')).toBe('/foo');
      expect(normalizePath('/test/./bar')).toBe('/test/bar');
      expect(normalizePath('/test//double')).toBe('/test/double');
    });

    it('getRelativePath should return relative path between two paths', () => {
      const from = '/test/from';
      const to = '/test/to/file.txt';
      expect(getRelativePath(from, to)).toBe(path.relative(from, to));
    });
  });
});
