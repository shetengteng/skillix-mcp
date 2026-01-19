/**
 * 版本管理服务测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import * as nodeFs from 'node:fs';
import { createTempDir, cleanupTempDir, createTestSkill } from '../helpers/setup.js';
import * as skillService from '../../src/services/skill/index.js';
import { TEST_SKILL_MD } from '../fixtures/skills.js';

describe('version service', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('createVersionBackup', () => {
    it('should create backup of existing skill', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'backup-test-skill', TEST_SKILL_MD);
      
      const skill = skillService.getSkill('backup-test-skill', projectRoot);
      expect(skill).not.toBeNull();
      
      const backup = skillService.createVersionBackup(skill!, 'Test backup');
      
      expect(backup).not.toBeNull();
      expect(backup?.version).toBe('1.0.0');
      expect(backup?.reason).toBe('Test backup');
      expect(backup?.backupFile).toBe('SKILL.md.1');
      
      // 检查备份文件是否存在
      const backupDir = skillService.getBackupDir(skill!.path);
      expect(nodeFs.existsSync(path.join(backupDir, 'SKILL.md.1'))).toBe(true);
      expect(nodeFs.existsSync(path.join(backupDir, 'SKILL.md.1.meta.json'))).toBe(true);
    });

    it('should create multiple backups with incrementing numbers', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'multi-backup-skill', TEST_SKILL_MD);
      
      const skill = skillService.getSkill('multi-backup-skill', projectRoot);
      
      const backup1 = skillService.createVersionBackup(skill!, 'First backup');
      const backup2 = skillService.createVersionBackup(skill!, 'Second backup');
      const backup3 = skillService.createVersionBackup(skill!, 'Third backup');
      
      expect(backup1?.backupFile).toBe('SKILL.md.1');
      expect(backup2?.backupFile).toBe('SKILL.md.2');
      expect(backup3?.backupFile).toBe('SKILL.md.3');
    });
  });

  describe('listVersions', () => {
    it('should list all backup versions', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'list-versions-skill', TEST_SKILL_MD);
      
      const skill = skillService.getSkill('list-versions-skill', projectRoot);
      
      // 创建多个备份
      skillService.createVersionBackup(skill!, 'Backup 1');
      skillService.createVersionBackup(skill!, 'Backup 2');
      
      const versions = skillService.listVersions(skill!.path);
      
      expect(versions.length).toBe(2);
      // 应该按时间倒序排列
      expect(versions[0].backupFile).toBe('SKILL.md.2');
      expect(versions[1].backupFile).toBe('SKILL.md.1');
    });

    it('should return empty array when no backups exist', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'no-backup-skill', TEST_SKILL_MD);
      
      const skill = skillService.getSkill('no-backup-skill', projectRoot);
      const versions = skillService.listVersions(skill!.path);
      
      expect(versions).toEqual([]);
    });
  });

  describe('updateSkill with backup', () => {
    it('should create backup when updating skill (default behavior)', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'update-backup-skill', TEST_SKILL_MD);
      
      // 更新技能（默认会创建备份）
      skillService.updateSkill('update-backup-skill', {
        metadata: { name: 'update-backup-skill', description: 'Updated', version: '1.1.0' },
      }, projectRoot);
      
      const skill = skillService.getSkill('update-backup-skill', projectRoot);
      const versions = skillService.listVersions(skill!.path);
      
      // 应该有一个备份
      expect(versions.length).toBe(1);
      expect(versions[0].version).toBe('1.0.0'); // 备份的是旧版本
    });

    it('should not create backup when createBackup is false', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'no-backup-update-skill', TEST_SKILL_MD);
      
      // 更新技能，禁用备份
      skillService.updateSkill('no-backup-update-skill', {
        metadata: { name: 'no-backup-update-skill', description: 'Updated', version: '1.1.0' },
      }, { projectRoot, createBackup: false });
      
      const skill = skillService.getSkill('no-backup-update-skill', projectRoot);
      const versions = skillService.listVersions(skill!.path);
      
      // 不应该有备份
      expect(versions.length).toBe(0);
    });

    it('should record reason in evolution log', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'reason-skill', TEST_SKILL_MD);
      
      // 更新技能，带原因
      skillService.updateSkill('reason-skill', {
        metadata: { name: 'reason-skill', description: 'Updated', version: '1.1.0' },
      }, { projectRoot, reason: '修复 bug' });
      
      const skill = skillService.getSkill('reason-skill', projectRoot);
      const logPath = skillService.getEvolutionLogPath(skill!.path);
      
      expect(nodeFs.existsSync(logPath)).toBe(true);
      
      const logContent = nodeFs.readFileSync(logPath, 'utf-8');
      expect(logContent).toContain('修复 bug');
      expect(logContent).toContain('1.0.0 -> 1.1.0');
    });
  });

  describe('rollbackSkill', () => {
    it('should rollback to previous version', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'rollback-skill', TEST_SKILL_MD);
      
      // 更新技能（会创建备份）
      skillService.updateSkill('rollback-skill', {
        metadata: { name: 'rollback-skill', description: 'Updated v1.1', version: '1.1.0' },
      }, projectRoot);
      
      // 验证更新成功
      let skill = skillService.getSkill('rollback-skill', projectRoot);
      expect(skill?.metadata.version).toBe('1.1.0');
      
      // 回退到 1.0.0
      const result = skillService.rollbackSkill('rollback-skill', '1.0.0', { projectRoot });
      
      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe('1.1.0');
      expect(result.toVersion).toBe('1.0.0');
      
      // 验证回退成功
      skill = skillService.getSkill('rollback-skill', projectRoot);
      expect(skill?.metadata.version).toBe('1.0.0');
    });

    it('should fail when target version does not exist', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'no-version-skill', TEST_SKILL_MD);
      
      const result = skillService.rollbackSkill('no-version-skill', '0.0.1', { projectRoot });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('未找到版本');
    });

    it('should fail when skill does not exist', () => {
      const projectRoot = tempDir;
      
      const result = skillService.rollbackSkill('non-existing-skill', '1.0.0', { projectRoot });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('不存在');
    });
  });

  describe('rollbackToPrevious', () => {
    it('should rollback to the most recent backup', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'prev-rollback-skill', TEST_SKILL_MD);
      
      // 更新两次
      skillService.updateSkill('prev-rollback-skill', {
        metadata: { name: 'prev-rollback-skill', description: 'v1.1', version: '1.1.0' },
      }, projectRoot);
      
      skillService.updateSkill('prev-rollback-skill', {
        metadata: { name: 'prev-rollback-skill', description: 'v1.2', version: '1.2.0' },
      }, projectRoot);
      
      // 回退到上一个版本
      const result = skillService.rollbackToPrevious('prev-rollback-skill', { projectRoot });
      
      expect(result.success).toBe(true);
      expect(result.toVersion).toBe('1.1.0');
    });
  });

  describe('getVersionHistory', () => {
    it('should return version history', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'history-skill', TEST_SKILL_MD);
      
      // 更新几次
      skillService.updateSkill('history-skill', {
        metadata: { name: 'history-skill', description: 'v1.1', version: '1.1.0' },
      }, projectRoot);
      
      skillService.updateSkill('history-skill', {
        metadata: { name: 'history-skill', description: 'v1.2', version: '1.2.0' },
      }, projectRoot);
      
      const history = skillService.getVersionHistory('history-skill', projectRoot);
      
      expect(history).not.toBeNull();
      expect(history?.currentVersion).toBe('1.2.0');
      expect(history?.versions.length).toBe(2);
    });

    it('should return null for non-existing skill', () => {
      const projectRoot = tempDir;
      
      const history = skillService.getVersionHistory('non-existing', projectRoot);
      
      expect(history).toBeNull();
    });
  });

  describe('cleanupOldBackups', () => {
    it('should keep only specified number of backups', () => {
      const projectRoot = tempDir;
      const projectSkillsDir = path.join(projectRoot, '.skillix', 'skills');
      nodeFs.mkdirSync(projectSkillsDir, { recursive: true });
      createTestSkill(projectSkillsDir, 'cleanup-skill', TEST_SKILL_MD);
      
      const skill = skillService.getSkill('cleanup-skill', projectRoot);
      
      // 创建 5 个备份
      for (let i = 0; i < 5; i++) {
        skillService.createVersionBackup(skill!, `Backup ${i + 1}`);
      }
      
      let versions = skillService.listVersions(skill!.path);
      expect(versions.length).toBe(5);
      
      // 清理，只保留 2 个
      const deleted = skillService.cleanupOldBackups(skill!.path, 2);
      
      expect(deleted).toBe(3);
      
      versions = skillService.listVersions(skill!.path);
      expect(versions.length).toBe(2);
    });
  });
});
