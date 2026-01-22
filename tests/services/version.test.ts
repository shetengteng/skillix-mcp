/**
 * 版本管理服务测试
 * 
 * 测试覆盖：
 * - 版本备份创建
 * - 版本列表
 * - 版本恢复
 * - 进化日志
 * - 回退功能
 * - 备份清理
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

import { getSkill } from '../../src/services/skill/get.js';
import {
  createVersionBackup,
  listVersions,
  restoreFromBackup,
  getVersionBackup,
  cleanupOldBackups,
  getBackupDir,
  logEvolution,
  getEvolutionLogPath,
} from '../../src/services/skill/version.js';
import {
  rollbackSkill,
  rollbackToPrevious,
  getVersionHistory,
} from '../../src/services/skill/rollback.js';
import * as fsUtils from '../../src/utils/fs.js';

describe('版本管理服务', () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    cleanupTestEnv();
    vi.clearAllMocks();
  });

  describe('createVersionBackup - 创建版本备份', () => {
    it('应该创建现有技能的备份', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'backup-test-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('backup-test-skill');
      expect(skill).not.toBeNull();
      
      const backup = createVersionBackup(skill!, '测试备份');
      
      expect(backup).not.toBeNull();
      expect(backup?.version).toBe('1.0.0');
      expect(backup?.reason).toBe('测试备份');
      expect(backup?.backupFile).toBe('SKILL.md.1');
      
      // 检查备份文件是否存在
      const backupDir = getBackupDir(skill!.path);
      expect(fsUtils.exists(path.join(backupDir, 'SKILL.md.1'))).toBe(true);
      expect(fsUtils.exists(path.join(backupDir, 'SKILL.md.1.meta.json'))).toBe(true);
    });

    it('应该创建多个递增编号的备份', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'multi-backup-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('multi-backup-skill');
      
      const backup1 = createVersionBackup(skill!, '第一次备份');
      const backup2 = createVersionBackup(skill!, '第二次备份');
      const backup3 = createVersionBackup(skill!, '第三次备份');
      
      expect(backup1?.backupFile).toBe('SKILL.md.1');
      expect(backup2?.backupFile).toBe('SKILL.md.2');
      expect(backup3?.backupFile).toBe('SKILL.md.3');
    });

    it('技能路径不存在时应该返回 null', () => {
      // 创建一个真实的技能先
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'temp-skill', SKILL_MD_CONTENT);
      const realSkill = getSkill('temp-skill');
      expect(realSkill).not.toBeNull();
      
      // 修改路径为不存在的路径
      const fakeSkill = {
        ...realSkill!,
        path: path.join(TEST_GLOBAL_SKILLS_DIR, 'non-existing-skill'),
      };
      
      // 由于 SKILL.md 不存在，应该返回 null
      const backup = createVersionBackup(fakeSkill);
      expect(backup).toBeNull();
    });
  });

  describe('listVersions - 列出版本', () => {
    it('应该列出所有备份版本', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'list-versions-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('list-versions-skill');
      
      // 创建多个备份
      createVersionBackup(skill!, '备份 1');
      createVersionBackup(skill!, '备份 2');
      
      const versions = listVersions(skill!.path);
      
      expect(versions.length).toBe(2);
      // 验证两个备份都存在
      const backupFiles = versions.map(v => v.backupFile);
      expect(backupFiles).toContain('SKILL.md.1');
      expect(backupFiles).toContain('SKILL.md.2');
    });

    it('没有备份时应该返回空数组', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'no-backup-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('no-backup-skill');
      const versions = listVersions(skill!.path);
      
      expect(versions).toEqual([]);
    });
  });

  describe('restoreFromBackup - 从备份恢复', () => {
    it('应该从备份恢复技能', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'restore-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('restore-skill');
      
      // 创建备份
      const backup = createVersionBackup(skill!, '恢复测试');
      expect(backup).not.toBeNull();
      
      // 恢复
      const result = restoreFromBackup(skill!.path, backup!.backupFile);
      
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('备份文件不存在时应该返回错误', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'restore-error-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('restore-error-skill');
      
      const result = restoreFromBackup(skill!.path, 'non-existing.backup');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getVersionBackup - 获取指定版本备份', () => {
    it('应该获取指定版本的备份', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'get-version-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('get-version-skill');
      
      // 创建备份
      createVersionBackup(skill!, '版本备份');
      
      const backup = getVersionBackup(skill!.path, '1.0.0');
      
      expect(backup).not.toBeNull();
      expect(backup?.content).toBeDefined();
      expect(backup?.metadata).toBeDefined();
    });

    it('版本不存在时应该返回 null', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'no-version-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('no-version-skill');
      
      const backup = getVersionBackup(skill!.path, '99.99.99');
      
      expect(backup).toBeNull();
    });
  });

  describe('cleanupOldBackups - 清理旧备份', () => {
    it('应该保留指定数量的备份', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'cleanup-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('cleanup-skill');
      
      // 创建 5 个备份
      for (let i = 0; i < 5; i++) {
        createVersionBackup(skill!, `备份 ${i + 1}`);
      }
      
      // 清理，只保留 2 个
      const deletedCount = cleanupOldBackups(skill!.path, 2);
      
      expect(deletedCount).toBe(3);
      
      const remaining = listVersions(skill!.path);
      expect(remaining.length).toBe(2);
    });

    it('备份数量不超过保留数量时不应删除', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'no-cleanup-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('no-cleanup-skill');
      
      // 创建 2 个备份
      createVersionBackup(skill!, '备份 1');
      createVersionBackup(skill!, '备份 2');
      
      // 保留 5 个
      const deletedCount = cleanupOldBackups(skill!.path, 5);
      
      expect(deletedCount).toBe(0);
    });
  });

  describe('logEvolution - 进化日志', () => {
    it('应该记录进化日志', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'evolution-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('evolution-skill');
      
      logEvolution(skill!, '1.0.0', '2.0.0', '功能升级');
      
      const logPath = getEvolutionLogPath(skill!.path);
      expect(fsUtils.exists(logPath)).toBe(true);
      
      const logContent = fsUtils.readFile(logPath);
      expect(logContent).toContain('1.0.0 -> 2.0.0');
      expect(logContent).toContain('功能升级');
    });
  });

  describe('rollbackSkill - 回退技能', () => {
    it('应该回退到指定版本', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'rollback-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('rollback-skill');
      
      // 创建备份
      createVersionBackup(skill!, '原始版本');
      
      // 回退
      const result = rollbackSkill('rollback-skill', '1.0.0', {
        reason: '回退测试',
      });
      
      expect(result.success).toBe(true);
      expect(result.toVersion).toBe('1.0.0');
    });

    it('技能不存在时应该返回错误', () => {
      const result = rollbackSkill('non-existing-skill', '1.0.0');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('不存在');
    });

    it('目标版本不存在时应该返回错误', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'no-version-rollback', SKILL_MD_CONTENT);
      
      const result = rollbackSkill('no-version-rollback', '99.99.99');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('备份');
    });
  });

  describe('rollbackToPrevious - 回退到上一版本', () => {
    it('应该回退到上一个版本', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'previous-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('previous-skill');
      
      // 创建备份
      createVersionBackup(skill!, '上一个版本');
      
      const result = rollbackToPrevious('previous-skill');
      
      expect(result.success).toBe(true);
    });

    it('没有备份时应该返回错误', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'no-previous-skill', SKILL_MD_CONTENT);
      
      const result = rollbackToPrevious('no-previous-skill');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('备份');
    });
  });

  describe('getVersionHistory - 获取版本历史', () => {
    it('应该返回版本历史', () => {
      createTestSkillDir(TEST_GLOBAL_SKILLS_DIR, 'history-skill', SKILL_MD_CONTENT);
      
      const skill = getSkill('history-skill');
      
      // 创建备份
      createVersionBackup(skill!, '历史版本 1');
      createVersionBackup(skill!, '历史版本 2');
      
      const history = getVersionHistory('history-skill');
      
      expect(history).not.toBeNull();
      expect(history?.currentVersion).toBe('1.0.0');
      expect(history?.versions.length).toBe(2);
    });

    it('技能不存在时应该返回 null', () => {
      const history = getVersionHistory('non-existing-skill');
      expect(history).toBeNull();
    });
  });
});
