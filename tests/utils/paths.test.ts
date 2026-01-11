/**
 * paths 工具函数测试
 */

import { describe, it, expect } from 'vitest';
import * as os from 'node:os';
import * as path from 'node:path';
import * as paths from '../../src/utils/paths.js';

describe('paths utils', () => {
  describe('getGlobalDir', () => {
    it('should return ~/.skillix path', () => {
      const result = paths.getGlobalDir();
      expect(result).toBe(path.join(os.homedir(), '.skillix'));
    });
  });

  describe('getGlobalConfigPath', () => {
    it('should return ~/.skillix/config.json path', () => {
      const result = paths.getGlobalConfigPath();
      expect(result).toBe(path.join(os.homedir(), '.skillix', 'config.json'));
    });
  });

  describe('getGlobalSkillsDir', () => {
    it('should return ~/.skillix/skills path', () => {
      const result = paths.getGlobalSkillsDir();
      expect(result).toBe(path.join(os.homedir(), '.skillix', 'skills'));
    });
  });

  describe('getProjectDir', () => {
    it('should return {projectRoot}/.skillix path', () => {
      const projectRoot = '/path/to/project';
      const result = paths.getProjectDir(projectRoot);
      expect(result).toBe(path.join(projectRoot, '.skillix'));
    });
  });

  describe('getProjectConfigPath', () => {
    it('should return {projectRoot}/.skillix/config.json path', () => {
      const projectRoot = '/path/to/project';
      const result = paths.getProjectConfigPath(projectRoot);
      expect(result).toBe(path.join(projectRoot, '.skillix', 'config.json'));
    });
  });

  describe('getProjectSkillsDir', () => {
    it('should return {projectRoot}/.skillix/skills path', () => {
      const projectRoot = '/path/to/project';
      const result = paths.getProjectSkillsDir(projectRoot);
      expect(result).toBe(path.join(projectRoot, '.skillix', 'skills'));
    });
  });

  describe('getSkillDir', () => {
    it('should return {skillsDir}/{skillName} path', () => {
      const skillsDir = '/path/to/skills';
      const skillName = 'my-skill';
      const result = paths.getSkillDir(skillsDir, skillName);
      expect(result).toBe(path.join(skillsDir, skillName));
    });
  });

  describe('getSkillMdPath', () => {
    it('should return {skillDir}/SKILL.md path', () => {
      const skillDir = '/path/to/skill';
      const result = paths.getSkillMdPath(skillDir);
      expect(result).toBe(path.join(skillDir, 'SKILL.md'));
    });
  });

  describe('getSkillScriptsDir', () => {
    it('should return {skillDir}/scripts path', () => {
      const skillDir = '/path/to/skill';
      const result = paths.getSkillScriptsDir(skillDir);
      expect(result).toBe(path.join(skillDir, 'scripts'));
    });
  });

  describe('getSkillReferencesDir', () => {
    it('should return {skillDir}/references path', () => {
      const skillDir = '/path/to/skill';
      const result = paths.getSkillReferencesDir(skillDir);
      expect(result).toBe(path.join(skillDir, 'references'));
    });
  });

  describe('getSkillAssetsDir', () => {
    it('should return {skillDir}/assets path', () => {
      const skillDir = '/path/to/skill';
      const result = paths.getSkillAssetsDir(skillDir);
      expect(result).toBe(path.join(skillDir, 'assets'));
    });
  });

  describe('getSkillLogsDir', () => {
    it('should return {skillDir}/logs path', () => {
      const skillDir = '/path/to/skill';
      const result = paths.getSkillLogsDir(skillDir);
      expect(result).toBe(path.join(skillDir, 'logs'));
    });
  });
});
